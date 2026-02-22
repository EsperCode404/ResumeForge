class ResumeForge {
    constructor() {
        this.resumeData = {
            personal: {},
            summary: '',
            experience: [],
            education: [],
            skills: []
        };
        this.currentTemplate = 'modern';
        this.zoomLevel = 1;
        this.aiEnabled = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updatePreview();
        this.updateStats();
        this.updateTimestamp();
        setInterval(() => this.updateTimestamp(), 1000);
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.togglePreview();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('aiAssistBtn').addEventListener('click', () => {
            this.toggleAI();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Template selector
        document.getElementById('templateSelect').addEventListener('change', (e) => {
            this.currentTemplate = e.target.value;
            this.updatePreview();
        });

        // Section toggles
        document.querySelectorAll('.toggle-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.section');
                const content = section.querySelector('.section-content');
                content.classList.toggle('active');
                const icon = e.target.querySelector('i') || e.target;
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });

        // Add item buttons
        document.querySelectorAll('.add-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.addItem(section);
            });
        });

        // Form inputs
        this.setupFormListeners();

        // Preview controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomLevel = Math.min(this.zoomLevel * 1.2, 2);
            this.updateZoom();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
            this.updateZoom();
        });

        document.getElementById('resetZoom').addEventListener('click', () => {
            this.zoomLevel = 1;
            this.updateZoom();
        });

        // AI features
        document.getElementById('analyzeJobBtn').addEventListener('click', () => {
            this.analyzeJobDescription();
        });

        // AI suggest buttons
        document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.dataset.field;
                this.generateAISuggestion(field);
            });
        });

        // Export modal
        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportResume(format);
            });
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideExportModal();
        });

        // Modal backdrop click
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                this.hideExportModal();
            }
        });
    }

    setupFormListeners() {
        // Personal info
        const personalFields = ['fullName', 'title', 'email', 'phone', 'location', 'linkedin', 'portfolio'];
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.resumeData.personal[field] = e.target.value;
                    this.updatePreview();
                    this.updateStats();
                });
            }
        });

        // Summary
        const summaryElement = document.getElementById('summary');
        if (summaryElement) {
            summaryElement.addEventListener('input', (e) => {
                this.resumeData.summary = e.target.value;
                this.updatePreview();
                this.updateStats();
                this.generateAISuggestions();
            });
        }
    }

    addItem(section) {
        let item;
        
        switch(section) {
            case 'experience':
                item = {
                    id: Date.now(),
                    title: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: ''
                };
                this.resumeData.experience.push(item);
                this.renderExperienceItem(item);
                break;
                
            case 'education':
                item = {
                    id: Date.now(),
                    degree: '',
                    school: '',
                    location: '',
                    graduationDate: '',
                    gpa: ''
                };
                this.resumeData.education.push(item);
                this.renderEducationItem(item);
                break;
                
            case 'skills':
                item = {
                    id: Date.now(),
                    category: '',
                    skills: []
                };
                this.resumeData.skills.push(item);
                this.renderSkillItem(item);
                break;
        }
        
        this.updatePreview();
        this.updateStats();
    }

    renderExperienceItem(item) {
        const container = document.getElementById('experienceList');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'experience-item';
        itemDiv.dataset.id = item.id;
        
        itemDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">New Experience</span>
                <button class="remove-item" onclick="resumeForge.removeItem('experience', ${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" placeholder="Job Title" value="${item.title}" 
                       onchange="resumeForge.updateExperienceItem(${item.id}, 'title', this.value)">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Company" value="${item.company}"
                       onchange="resumeForge.updateExperienceItem(${item.id}, 'company', this.value)">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Location" value="${item.location}"
                       onchange="resumeForge.updateExperienceItem(${item.id}, 'location', this.value)">
            </div>
            <div class="form-group">
                <input type="month" placeholder="Start Date" value="${item.startDate}"
                       onchange="resumeForge.updateExperienceItem(${item.id}, 'startDate', this.value)">
                <input type="month" placeholder="End Date" value="${item.endDate}"
                       onchange="resumeForge.updateExperienceItem(${item.id}, 'endDate', this.value)">
            </div>
            <div class="form-group">
                <textarea placeholder="Job Description" rows="3"
                          onchange="resumeForge.updateExperienceItem(${item.id}, 'description', this.value)">${item.description}</textarea>
            </div>
        `;
        
        container.appendChild(itemDiv);
    }

    renderEducationItem(item) {
        const container = document.getElementById('educationList');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'education-item';
        itemDiv.dataset.id = item.id;
        
        itemDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">New Education</span>
                <button class="remove-item" onclick="resumeForge.removeItem('education', ${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" placeholder="Degree" value="${item.degree}"
                       onchange="resumeForge.updateEducationItem(${item.id}, 'degree', this.value)">
            </div>
            <div class="form-group">
                <input type="text" placeholder="School" value="${item.school}"
                       onchange="resumeForge.updateEducationItem(${item.id}, 'school', this.value)">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Location" value="${item.location}"
                       onchange="resumeForge.updateEducationItem(${item.id}, 'location', this.value)">
            </div>
            <div class="form-group">
                <input type="month" placeholder="Graduation Date" value="${item.graduationDate}"
                       onchange="resumeForge.updateEducationItem(${item.id}, 'graduationDate', this.value)">
            </div>
        `;
        
        container.appendChild(itemDiv);
    }

    renderSkillItem(item) {
        const container = document.getElementById('skillsList');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'skill-item';
        itemDiv.dataset.id = item.id;
        
        itemDiv.innerHTML = `
            <div class="item-header">
                <span class="item-title">New Skill Category</span>
                <button class="remove-item" onclick="resumeForge.removeItem('skills', ${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" placeholder="Category (e.g., Programming Languages)" value="${item.category}"
                       onchange="resumeForge.updateSkillItem(${item.id}, 'category', this.value)">
            </div>
            <div class="form-group">
                <input type="text" placeholder="Skills (comma-separated)" value="${item.skills.join(', ')}"
                       onchange="resumeForge.updateSkillItem(${item.id}, 'skills', this.value)">
            </div>
        `;
        
        container.appendChild(itemDiv);
    }

    updateExperienceItem(id, field, value) {
        const item = this.resumeData.experience.find(exp => exp.id === id);
        if (item) {
            item[field] = value;
            this.updatePreview();
            this.updateStats();
        }
    }

    updateEducationItem(id, field, value) {
        const item = this.resumeData.education.find(edu => edu.id === id);
        if (item) {
            item[field] = value;
            this.updatePreview();
            this.updateStats();
        }
    }

    updateSkillItem(id, field, value) {
        const item = this.resumeData.skills.find(skill => skill.id === id);
        if (item) {
            if (field === 'skills') {
                item[field] = value.split(',').map(s => s.trim());
            } else {
                item[field] = value;
            }
            this.updatePreview();
            this.updateStats();
        }
    }

    removeItem(section, id) {
        switch(section) {
            case 'experience':
                this.resumeData.experience = this.resumeData.experience.filter(exp => exp.id !== id);
                break;
            case 'education':
                this.resumeData.education = this.resumeData.education.filter(edu => edu.id !== id);
                break;
            case 'skills':
                this.resumeData.skills = this.resumeData.skills.filter(skill => skill.id !== id);
                break;
        }
        
        // Remove from DOM
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.remove();
        }
        
        this.updatePreview();
        this.updateStats();
    }

    updatePreview() {
        const preview = document.getElementById('resumePreview');
        preview.innerHTML = this.generateResumeHTML();
    }

    generateResumeHTML() {
        const data = this.resumeData;
        
        switch(this.currentTemplate) {
            case 'modern':
                return this.generateModernTemplate(data);
            case 'creative':
                return this.generateCreativeTemplate(data);
            case 'professional':
                return this.generateProfessionalTemplate(data);
            case 'minimal':
                return this.generateMinimalTemplate(data);
            default:
                return this.generateModernTemplate(data);
        }
    }

    generateModernTemplate(data) {
        return `
            <div class="resume-modern">
                <header class="resume-header">
                    <h1>${data.personal.fullName || 'Your Name'}</h1>
                    <p class="resume-title">${data.personal.title || 'Professional Title'}</p>
                    <div class="contact-info">
                        ${data.personal.email ? `<div class="contact-item">📧 ${data.personal.email}</div>` : ''}
                        ${data.personal.phone ? `<div class="contact-item">📱 ${data.personal.phone}</div>` : ''}
                        ${data.personal.location ? `<div class="contact-item">📍 ${data.personal.location}</div>` : ''}
                        ${data.personal.linkedin ? `<div class="contact-item">💼 ${data.personal.linkedin}</div>` : ''}
                        ${data.personal.portfolio ? `<div class="contact-item">🌐 ${data.personal.portfolio}</div>` : ''}
                    </div>
                </header>
                
                ${data.summary ? `
                <section class="resume-section">
                    <h2>Professional Summary</h2>
                    <p>${data.summary}</p>
                </section>
                ` : ''}
                
                ${data.experience.length > 0 ? `
                <section class="resume-section">
                    <h2>Work Experience</h2>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header">
                                <div>
                                    <h3>${exp.title}</h3>
                                    <p class="item-subtitle">${exp.company} • ${exp.location}</p>
                                </div>
                                <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                            </div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </section>
                ` : ''}
                
                ${data.education.length > 0 ? `
                <section class="resume-section">
                    <h2>Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <div>
                                    <h3>${edu.degree}</h3>
                                    <p class="item-subtitle">${edu.school} • ${edu.location}</p>
                                </div>
                                <div class="item-date">${edu.graduationDate}</div>
                            </div>
                        </div>
                    `).join('')}
                </section>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <section class="resume-section">
                    <h2>Skills</h2>
                    <div class="skills-grid">
                        ${data.skills.map(skill => `
                            <div class="skill-category">
                                <strong>${skill.category}:</strong>
                                <div class="skill-tags">
                                    ${skill.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
            </div>
        `;
    }

    updateStats() {
        const allText = this.getAllText();
        const words = allText.split(/\s+/).filter(word => word.length > 0);
        const characters = allText.length;
        
        document.getElementById('wordCount').textContent = words.length;
        document.getElementById('charCount').textContent = characters;
        
        // Calculate ATS score
        const atsScore = this.calculateATSScore();
        document.getElementById('atsScore').textContent = atsScore + '%';
        
        // Update AI metrics
        this.updateAIMetrics();
    }

    getAllText() {
        let text = '';
        text += Object.values(this.resumeData.personal).join(' ');
        text += ' ' + this.resumeData.summary;
        text += ' ' + this.resumeData.experience.map(exp => 
            `${exp.title} ${exp.company} ${exp.description}`
        ).join(' ');
        text += ' ' + this.resumeData.education.map(edu => 
            `${edu.degree} ${edu.school}`
        ).join(' ');
        text += ' ' + this.resumeData.skills.map(skill => 
            `${skill.category} ${skill.skills.join(' ')}`
        ).join(' ');
        
        return text;
    }

    calculateATSScore() {
        let score = 0;
        const text = this.getAllText().toLowerCase();
        
        // Check for key sections
        if (this.resumeData.summary) score += 20;
        if (this.resumeData.experience.length > 0) score += 30;
        if (this.resumeData.education.length > 0) score += 20;
        if (this.resumeData.skills.length > 0) score += 20;
        
        // Check for action verbs
        const actionVerbs = ['managed', 'developed', 'implemented', 'created', 'led', 'achieved', 'improved', 'designed'];
        const foundVerbs = actionVerbs.filter(verb => text.includes(verb));
        score += Math.min(foundVerbs.length * 2, 10);
        
        return Math.min(score, 100);
    }

    updateAIMetrics() {
        const strength = this.calculateStrengthScore();
        const keywords = this.calculateKeywordsScore();
        const impact = this.calculateImpactScore();
        
        document.getElementById('strengthBar').style.width = strength + '%';
        document.getElementById('strengthValue').textContent = strength + '%';
        
        document.getElementById('keywordsBar').style.width = keywords + '%';
        document.getElementById('keywordsValue').textContent = keywords + '%';
        
        document.getElementById('impactBar').style.width = impact + '%';
        document.getElementById('impactValue').textContent = impact + '%';
    }

    calculateStrengthScore() {
        let score = 0;
        if (this.resumeData.personal.fullName) score += 10;
        if (this.resumeData.summary && this.resumeData.summary.length > 50) score += 20;
        if (this.resumeData.experience.length >= 2) score += 30;
        if (this.resumeData.education.length > 0) score += 20;
        if (this.resumeData.skills.length > 0) score += 20;
        return Math.min(score, 100);
    }

    calculateKeywordsScore() {
        const text = this.getAllText().toLowerCase();
        const techKeywords = ['javascript', 'python', 'react', 'node', 'html', 'css', 'sql', 'git', 'aws', 'docker'];
        const foundKeywords = techKeywords.filter(keyword => text.includes(keyword));
        return Math.min(foundKeywords.length * 10, 100);
    }

    calculateImpactScore() {
        const text = this.getAllText().toLowerCase();
        const impactWords = ['increased', 'decreased', 'improved', 'reduced', 'achieved', 'generated', 'saved'];
        const foundImpact = impactWords.filter(word => text.includes(word));
        return Math.min(foundImpact.length * 15, 100);
    }

    updateZoom() {
        const preview = document.getElementById('resumePreview');
        preview.style.transform = `scale(${this.zoomLevel})`;
    }

    togglePreview() {
        // Implementation for fullscreen preview
        const preview = document.querySelector('.preview-panel');
        preview.classList.toggle('fullscreen');
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        const btn = document.getElementById('aiAssistBtn');
        btn.classList.toggle('active');
        const aiPanel = document.querySelector('.ai-panel');
        aiPanel.style.display = this.aiEnabled ? 'flex' : 'none';
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
    }

    hideExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    }

    exportResume(format) {
        const data = this.resumeData;
        
        switch(format) {
            case 'pdf':
                this.exportToPDF();
                break;
            case 'docx':
                this.exportToWord();
                break;
            case 'html':
                this.exportToHTML();
                break;
            case 'json':
                this.exportToJSON();
                break;
        }
        
        this.hideExportModal();
    }

    exportToJSON() {
        const dataStr = JSON.stringify(this.resumeData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume.json';
        link.click();
    }

    exportToHTML() {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${this.resumeData.personal.fullName}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #1a1a2e; font-size: 2rem; margin-bottom: 0.5rem; }
                    h2 { color: #1a1a2e; font-size: 1.3rem; margin: 1.5rem 0 1rem 0; border-bottom: 2px solid #8b5cf6; padding-bottom: 0.5rem; }
                    .contact-info { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
                    .contact-item { color: #4a5568; font-size: 0.9rem; }
                    .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
                    .item-title { font-weight: 600; color: #1a1a2e; }
                    .item-date { color: #718096; font-size: 0.9rem; }
                    .item-subtitle { color: #4a5568; font-style: italic; margin-bottom: 0.5rem; }
                    .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                    .skill-tag { background: #f0f4f8; color: #4a5568; padding: 0.3rem 0.6rem; border-radius: 15px; font-size: 0.8rem; }
                </style>
            </head>
            <body>
                ${this.generateResumeHTML()}
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume.html';
        link.click();
    }

    async analyzeJobDescription() {
        const jobDesc = document.getElementById('jobDescription').value;
        if (!jobDesc) return;
        
        this.updateStatus('Analyzing job description...');
        
        setTimeout(() => {
            const keywords = this.extractKeywords(jobDesc);
            const suggestions = this.generateSuggestions(keywords);
            this.displayAISuggestions(suggestions);
            this.updateStatus('Analysis complete');
        }, 2000);
    }

    extractKeywords(text) {
        const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = text.toLowerCase().split(/\W+/);
        return words.filter(word => word.length > 3 && !commonWords.includes(word)).slice(0, 10);
    }

    generateSuggestions(keywords) {
        return [
            {
                type: 'keyword',
                text: `Add these keywords to your resume: ${keywords.join(', ')}`
            },
            {
                type: 'action',
                text: 'Use action verbs like "developed", "implemented", "led"'
            },
            {
                type: 'metric',
                text: 'Quantify achievements with numbers and percentages'
            }
        ];
    }

    displayAISuggestions(suggestions) {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <i class="fas fa-lightbulb"></i>
                <span>${suggestion.text}</span>
            </div>
        `).join('');
    }

    generateAISuggestion(field) {
        this.updateStatus('Generating AI suggestion...');
        
        setTimeout(() => {
            let suggestion = '';
            switch(field) {
                case 'summary':
                    suggestion = 'Experienced professional with a proven track record of delivering results and driving business success.';
                    break;
                default:
                    suggestion = 'Consider adding specific achievements and metrics to strengthen this section.';
            }
            
            this.updateStatus('Suggestion ready');
            this.applySuggestion(field, suggestion);
        }, 1500);
    }

    applySuggestion(field, suggestion) {
        switch(field) {
            case 'summary':
                document.getElementById('summary').value = suggestion;
                this.resumeData.summary = suggestion;
                break;
        }
        this.updatePreview();
    }

    setupAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
            document.getElementById('autoSave').textContent = 'Auto-saved';
            setTimeout(() => {
                document.getElementById('autoSave').textContent = '';
            }, 2000);
        }, 30000);
    }

    saveToLocalStorage() {
        localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('resumeData');
        if (saved) {
            try {
                this.resumeData = JSON.parse(saved);
                this.populateForm();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    populateForm() {
        Object.keys(this.resumeData.personal).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.resumeData.personal[key];
            }
        });

        const summaryElement = document.getElementById('summary');
        if (summaryElement) {
            summaryElement.value = this.resumeData.summary;
        }

        this.resumeData.experience.forEach(item => this.renderExperienceItem(item));
        this.resumeData.education.forEach(item => this.renderEducationItem(item));
        this.resumeData.skills.forEach(item => this.renderSkillItem(item));
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
        setTimeout(() => {
            document.getElementById('status').textContent = 'Ready';
        }, 3000);
    }

    updateTimestamp() {
        const now = new Date();
        document.getElementById('timestamp').textContent = 
            now.toLocaleTimeString('en-US', { hour12: false });
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all resume data? This will remove everything and cannot be undone.')) {
            localStorage.removeItem('resumeData');
            
            this.resumeData = {
                personal: {},
                summary: '',
                experience: [],
                education: [],
                skills: []
            };
            
            document.getElementById('fullName').value = '';
            document.getElementById('title').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('location').value = '';
            document.getElementById('linkedin').value = '';
            document.getElementById('portfolio').value = '';
            document.getElementById('summary').value = '';
            
            document.getElementById('experienceList').innerHTML = '';
            document.getElementById('educationList').innerHTML = '';
            document.getElementById('skillsList').innerHTML = '';
            
            this.updatePreview();
            this.updateStats();
            this.updateStatus('All data cleared');
            
            document.getElementById('aiSuggestions').innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Start building your resume to get AI suggestions</span>
                </div>
            `;
        }
    }
}

let resumeForge;
document.addEventListener('DOMContentLoaded', () => {
    resumeForge = new ResumeForge();
});