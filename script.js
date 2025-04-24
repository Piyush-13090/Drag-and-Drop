class WebsiteBuilderApp {
    constructor() {
        this.selectedElement = null;
        this.initApp();
    }

    initApp() {
        this.setupDragAndDrop();
        this.setupCanvas();
    }

    setupDragAndDrop() {
        // Setup component drag start
        document.querySelectorAll('.builder-component').forEach(component => {
            component.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', component.dataset.type);
                component.classList.add('dragging');
            });

            component.addEventListener('dragend', () => {
                component.classList.remove('dragging');
            });
        });

        // Setup canvas drop zone
        const canvas = document.getElementById('canvas-area');
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drop-active');
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drop-active');
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drop-active');
            
            const componentType = e.dataTransfer.getData('text/plain');
            if (componentType) {
                this.addNewElement(componentType);
            }
        });
    }

    setupCanvas() {
        const canvas = document.getElementById('canvas-area');
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                this.deselectAllElements();
                this.showDefaultPropertiesMessage();
                this.selectedElement = null;
            }
        });
    }

    addNewElement(elementType) {
        const elementId = 'element-' + Date.now();
        const { htmlTemplate, defaultProperties } = this.getElementTemplate(elementType);
        
        const element = document.createElement('div');
        element.className = 'canvas-element';
        element.id = elementId;
        element.dataset.type = elementType;
        element.innerHTML = `
            ${htmlTemplate}
            <div class="element-actions">
                <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Store element properties
        element.dataset.properties = JSON.stringify(defaultProperties);
        
        document.getElementById('canvas-area').appendChild(element);
        
        // Add event listeners
        element.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeElement(element);
        });
        
        element.addEventListener('click', (e) => {
            if (e.target === element || e.target.classList.contains('canvas-element')) {
                this.selectElement(element);
            }
        });
        
        // Remove the default message if it exists
        this.removeCanvasDefaultMessage();
    }

    getElementTemplate(elementType) {
        const templates = {
            'header': {
                htmlTemplate: `
                    <header class="header-component" style="background:#f8f9fa; padding:20px; display:flex; justify-content:space-between; align-items:center;">
                        <div class="editable header-logo" data-property="logo-text" style="font-size:24px; font-weight:bold;">Logo</div>
                        <nav class="header-nav">
                            <ul style="display:flex; list-style:none; gap:20px;">
                                <li><a href="#" class="editable nav-item" data-property="menu-1">Home</a></li>
                                <li><a href="#" class="editable nav-item" data-property="menu-2">About</a></li>
                                <li><a href="#" class="editable nav-item" data-property="menu-3">Contact</a></li>
                            </ul>
                        </nav>
                    </header>
                `,
                defaultProperties: {
                    'logo-text': 'Logo',
                    'menu-1': 'Home',
                    'menu-2': 'About',
                    'menu-3': 'Contact',
                    'bg-color': '#f8f9fa',
                    'text-color': '#333'
                }
            },
            'text': {
                htmlTemplate: `
                    <div class="text-component editable" data-property="content" style="padding:40px 20px; max-width:800px; margin:0 auto;">
                        <h2 class="editable text-heading" data-property="heading">About Us</h2>
                        <p class="editable text-paragraph" data-property="paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.</p>
                    </div>
                `,
                defaultProperties: {
                    'heading': 'About Us',
                    'paragraph': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.',
                    'text-align': 'left',
                    'text-color': '#333',
                    'bg-color': '#ffffff'
                }
            },
            'image': {
                htmlTemplate: `
                    <div class="image-component" style="padding:20px; text-align:center;">
                        <img class="image-content" src="https://via.placeholder.com/800x400" alt="Sample Image" style="max-width:100%; height:auto; border-radius:4px;">
                    </div>
                `,
                defaultProperties: {
                    'src': 'https://via.placeholder.com/800x400',
                    'alt': 'Sample Image',
                    'width': '100%',
                    'border-radius': '4px'
                }
            },
            'button': {
                htmlTemplate: `
                    <div class="button-container" style="padding:20px; text-align:center;">
                        <button class="editable button-element" data-property="button-text" style="background-color:#4a6bff; color:white; border:none; padding:12px 30px; font-size:16px; border-radius:4px; cursor:pointer;">
                            Click Me
                        </button>
                    </div>
                `,
                defaultProperties: {
                    'button-text': 'Click Me',
                    'bg-color': '#4a6bff',
                    'text-color': '#ffffff',
                    'padding': '12px 30px',
                    'border-radius': '4px'
                }
            },
            'section': {
                htmlTemplate: `
                    <div class="section-component" style="padding:40px 20px; background:#f0f7ff; margin:20px 0;">
                        <h2 class="editable section-title" data-property="section-title">Section Title</h2>
                        <p class="editable section-text" data-property="section-text">This is a content section. You can add any components inside it.</p>
                    </div>
                `,
                defaultProperties: {
                    'section-title': 'Section Title',
                    'section-text': 'This is a content section. You can add any components inside it.',
                    'bg-color': '#f0f7ff',
                    'padding': '40px 20px'
                }
            }
        };

        return templates[elementType] || { htmlTemplate: '', defaultProperties: {} };
    }

    removeElement(element) {
        element.remove();
        if (this.selectedElement === element) {
            this.selectedElement = null;
            this.showDefaultPropertiesMessage();
        }
    }

    selectElement(element) {
        this.deselectAllElements();
        element.classList.add('selected');
        this.selectedElement = element;
        this.showElementProperties(element);
    }

    deselectAllElements() {
        document.querySelectorAll('.canvas-element').forEach(element => {
            element.classList.remove('selected');
        });
    }

    showElementProperties(element) {
        const elementType = element.dataset.type;
        const properties = JSON.parse(element.dataset.properties);
        
        let propertiesHTML = `
            <div class="property-group">
                <h4>${this.capitalizeFirstLetter(elementType)} Properties</h4>
                <div class="property-control">
                    <label>Component Type</label>
                    <input type="text" value="${elementType}" readonly>
                </div>
        `;
        
        if (elementType === 'header') {
            propertiesHTML += this.getHeaderPropertiesHTML(properties);
        } else if (elementType === 'text') {
            propertiesHTML += this.getTextPropertiesHTML(properties);
        } else if (elementType === 'image') {
            propertiesHTML += this.getImagePropertiesHTML(properties, element);
        } else if (elementType === 'button') {
            propertiesHTML += this.getButtonPropertiesHTML(properties);
        } else if (elementType === 'section') {
            propertiesHTML += this.getSectionPropertiesHTML(properties);
        }
        
        propertiesHTML += `</div>`;
        document.getElementById('properties-container').innerHTML = propertiesHTML;
        
        // Setup property change listeners
        this.setupPropertyChangeListeners(element);
    }

    getHeaderPropertiesHTML(properties) {
        return `
            <div class="property-control">
                <label>Background Color</label>
                <input type="color" class="property-input" data-property="bg-color" value="${properties['bg-color'] || '#f8f9fa'}">
            </div>
            <div class="property-control">
                <label>Logo Text</label>
                <input type="text" class="property-input" data-property="logo-text" value="${properties['logo-text']}">
            </div>
            <div class="property-control">
                <label>Menu Item 1</label>
                <input type="text" class="property-input" data-property="menu-1" value="${properties['menu-1']}">
            </div>
            <div class="property-control">
                <label>Menu Item 2</label>
                <input type="text" class="property-input" data-property="menu-2" value="${properties['menu-2']}">
            </div>
            <div class="property-control">
                <label>Menu Item 3</label>
                <input type="text" class="property-input" data-property="menu-3" value="${properties['menu-3']}">
            </div>
            <div class="property-control">
                <label>Text Color</label>
                <input type="color" class="property-input" data-property="text-color" value="${properties['text-color'] || '#333333'}">
            </div>
        `;
    }

    getTextPropertiesHTML(properties) {
        return `
            <div class="property-control">
                <label>Background Color</label>
                <input type="color" class="property-input" data-property="bg-color" value="${properties['bg-color'] || '#ffffff'}">
            </div>
            <div class="property-control">
                <label>Heading</label>
                <input type="text" class="property-input" data-property="heading" value="${properties['heading']}">
            </div>
            <div class="property-control">
                <label>Paragraph</label>
                <textarea class="property-input" data-property="paragraph" rows="4">${properties['paragraph']}</textarea>
            </div>
            <div class="property-control">
                <label>Text Alignment</label>
                <select class="property-input" data-property="text-align">
                    <option value="left" ${properties['text-align'] === 'left' ? 'selected' : ''}>Left</option>
                    <option value="center" ${properties['text-align'] === 'center' ? 'selected' : ''}>Center</option>
                    <option value="right" ${properties['text-align'] === 'right' ? 'selected' : ''}>Right</option>
                </select>
            </div>
            <div class="property-control">
                <label>Text Color</label>
                <input type="color" class="property-input" data-property="text-color" value="${properties['text-color'] || '#333333'}">
            </div>
        `;
    }

    getImagePropertiesHTML(properties, element) {
        return `
            <div class="property-control">
                <label>Image URL</label>
                <input type="text" class="property-input" id="image-url-input" value="${properties['src']}">
                <button class="apply-url-btn" id="apply-image-url">Apply URL</button>
            </div>
            <div class="property-control">
                <label>Alt Text</label>
                <input type="text" class="property-input" data-property="alt" value="${properties['alt']}">
            </div>
            <div class="property-control">
                <label>Width</label>
                <input type="text" class="property-input" data-property="width" value="${properties['width']}">
            </div>
            <div class="property-control">
                <label>Border Radius (px)</label>
                <input type="number" class="property-input" data-property="border-radius" value="${properties['border-radius']}">
            </div>
            <div class="property-control">
                <label>Upload Image</label>
                <input type="file" class="image-upload" accept="image/*">
            </div>
            <div class="image-preview-container">
                <label>Image Preview</label>
                <img class="image-preview" src="${properties['src']}" alt="Preview">
            </div>
        `;
    }

    getButtonPropertiesHTML(properties) {
        return `
            <div class="property-control">
                <label>Button Text</label>
                <input type="text" class="property-input" data-property="button-text" value="${properties['button-text']}">
            </div>
            <div class="property-control">
                <label>Background Color</label>
                <input type="color" class="property-input" data-property="bg-color" value="${properties['bg-color'] || '#4a6bff'}">
            </div>
            <div class="property-control">
                <label>Text Color</label>
                <input type="color" class="property-input" data-property="text-color" value="${properties['text-color'] || '#ffffff'}">
            </div>
            <div class="property-control">
                <label>Padding</label>
                <input type="text" class="property-input" data-property="padding" value="${properties['padding']}">
            </div>
            <div class="property-control">
                <label>Border Radius (px)</label>
                <input type="number" class="property-input" data-property="border-radius" value="${properties['border-radius']}">
            </div>
        `;
    }

    getSectionPropertiesHTML(properties) {
        return `
            <div class="property-control">
                <label>Section Title</label>
                <input type="text" class="property-input" data-property="section-title" value="${properties['section-title']}">
            </div>
            <div class="property-control">
                <label>Section Text</label>
                <textarea class="property-input" data-property="section-text" rows="4">${properties['section-text']}</textarea>
            </div>
            <div class="property-control">
                <label>Background Color</label>
                <input type="color" class="property-input" data-property="bg-color" value="${properties['bg-color'] || '#f0f7ff'}">
            </div>
            <div class="property-control">
                <label>Padding</label>
                <input type="text" class="property-input" data-property="padding" value="${properties['padding']}">
            </div>
        `;
    }

    setupPropertyChangeListeners(element) {
        // Setup regular property inputs
        document.querySelectorAll('.property-input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateElementProperty(element, input.dataset.property, input.value);
            });
        });

        // Special handling for image component
        if (element.dataset.type === 'image') {
            // Apply URL button
            document.getElementById('apply-image-url').addEventListener('click', () => {
                const urlInput = document.getElementById('image-url-input');
                this.updateElementProperty(element, 'src', urlInput.value);
                this.updateImagePreview(element);
            });

            // Image upload
            document.querySelector('.image-upload').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.updateElementProperty(element, 'src', event.target.result);
                        document.getElementById('image-url-input').value = event.target.result;
                        this.updateImagePreview(element);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    updateElementProperty(element, property, value) {
        // Update the properties data
        const properties = JSON.parse(element.dataset.properties);
        properties[property] = value;
        element.dataset.properties = JSON.stringify(properties);
        
        // Apply changes to the element
        const elementType = element.dataset.type;
        
        if (elementType === 'header') {
            this.updateHeaderElement(element, property, value);
        } else if (elementType === 'text') {
            this.updateTextElement(element, property, value);
        } else if (elementType === 'image') {
            this.updateImageElement(element, property, value);
        } else if (elementType === 'button') {
            this.updateButtonElement(element, property, value);
        } else if (elementType === 'section') {
            this.updateSectionElement(element, property, value);
        }
    }

    updateHeaderElement(element, property, value) {
        const header = element.querySelector('header');
        
        if (property === 'logo-text') {
            element.querySelector('.header-logo').textContent = value;
        } else if (property.startsWith('menu-')) {
            const index = property.split('-')[1];
            element.querySelectorAll('.nav-item')[index-1].textContent = value;
        } else if (property === 'bg-color') {
            header.style.backgroundColor = value;
        } else if (property === 'text-color') {
            element.querySelectorAll('.nav-item').forEach(item => {
                item.style.color = value;
            });
        }
    }

    updateTextElement(element, property, value) {
        const textContainer = element.querySelector('.text-component');
        
        if (property === 'heading') {
            element.querySelector('.text-heading').textContent = value;
        } else if (property === 'paragraph') {
            element.querySelector('.text-paragraph').textContent = value;
        } else if (property === 'text-align') {
            textContainer.style.textAlign = value;
        } else if (property === 'text-color') {
            textContainer.style.color = value;
        } else if (property === 'bg-color') {
            textContainer.style.backgroundColor = value;
        }
    }

    updateImageElement(element, property, value) {
        const img = element.querySelector('.image-content');
        
        if (property === 'src') {
            img.src = value;
            this.updateImagePreview(element);
        } else if (property === 'alt') {
            img.alt = value;
        } else if (property === 'width') {
            img.style.width = value;
        } else if (property === 'border-radius') {
            img.style.borderRadius = value + 'px';
        }
    }

    updateImagePreview(element) {
        const preview = document.querySelector('.image-preview');
        if (preview) {
            preview.src = element.querySelector('.image-content').src;
        }
    }

    updateButtonElement(element, property, value) {
        const button = element.querySelector('.button-element');
        
        if (property === 'button-text') {
            button.textContent = value;
        } else if (property === 'bg-color') {
            button.style.backgroundColor = value;
        } else if (property === 'text-color') {
            button.style.color = value;
        } else if (property === 'padding') {
            button.style.padding = value;
        } else if (property === 'border-radius') {
            button.style.borderRadius = value + 'px';
        }
    }

    updateSectionElement(element, property, value) {
        const section = element.querySelector('.section-component');
        
        if (property === 'section-title') {
            element.querySelector('.section-title').textContent = value;
        } else if (property === 'section-text') {
            element.querySelector('.section-text').textContent = value;
        } else if (property === 'bg-color') {
            section.style.backgroundColor = value;
        } else if (property === 'padding') {
            section.style.padding = value;
        }
    }

    removeCanvasDefaultMessage() {
        const defaultMsg = document.querySelector('.canvas-default-message');
        if (defaultMsg) {
            defaultMsg.remove();
        }
    }

    showDefaultPropertiesMessage() {
        document.getElementById('properties-container').innerHTML = 
            '<p class="properties-default-message">Select a component to edit its properties</p>';
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteBuilderApp();
});