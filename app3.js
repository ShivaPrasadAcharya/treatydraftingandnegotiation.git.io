// app3.js - Rendering Functions
DataApp.prototype.render = function() {
    const container = document.getElementById('root');
    container.innerHTML = this.getHTML();
    this.attachEventListeners();
};

DataApp.prototype.getHTML = function() {
    const availableDatasets = Object.keys(this.originalData);
    
    let totalOriginalRecords, totalFilteredRecords;
    
    if (this.showMultipleDatasets) {
        totalOriginalRecords = Object.values(this.originalData).reduce((sum, data) => sum + data.length, 0);
        totalFilteredRecords = Object.values(this.filteredData).reduce((sum, data) => sum + data.length, 0);
    } else {
        totalOriginalRecords = this.originalData[this.currentDataset]?.length || 0;
        totalFilteredRecords = this.filteredData[this.currentDataset]?.length || 0;
    }

    const searchPosition = window.searchEngine.getCurrentPosition();

    return `
        <div class="container">
            <div class="header">
                <h2>🗃️Comprehensive Training on Treaty Drafting and Negotiation  </h2>
                <p>Developed by: Shiva Prasad Acharya, Supreme Court(2082) </p>
            </div>

            <div class="sticky-search">
                <div class="controls">
                    <div class="dataset-selector">
                        ${availableDatasets.map(dataset => {
                            const info = this.datasetInfo[dataset] || {};
                            const isActive = this.currentDataset === dataset;
                            return `<button class="dataset-btn ${isActive ? 'active' : ''}" data-dataset="${dataset}">
                                ${info.emoji || '📄'} ${info.name || dataset}
                            </button>`;
                        }).join('')}
                        <button class="multiple-datasets-toggle ${this.showMultipleDatasets ? 'active' : ''}" onclick="window.dataApp.toggleMultipleDatasets()">
                            ${this.showMultipleDatasets ? '📋 Single View' : '📊 Multiple View'}
                        </button>
                    </div>
                    
                    <div style="display: flex; align-items: center; flex: 1; gap: 10px;">
                        <input type="text" class="search-input" placeholder="🔍  Global search across datasets..." value="${this.searchTerm}">
                        ${this.searchTerm && searchPosition.total > 0 ? `
                            <div class="search-navigation">
                                <button class="search-nav-btn" onclick="window.searchEngine.navigateToMatch('prev')" ${searchPosition.total <= 1 ? 'disabled' : ''}>
                                    ⬆️ Prev
                                </button>
                                <div class="search-position">
                                    ${searchPosition.current}/${searchPosition.total}
                                </div>
                                <button class="search-nav-btn" onclick="window.searchEngine.navigateToMatch('next')" ${searchPosition.total <= 1 ? 'disabled' : ''}>
                                    ⬇️ Next
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <button class="help-btn">❓ Help</button>
                </div>

                <button class="sql-filter-toggle ${this.sqlFilterExpanded ? 'expanded' : ''}" onclick="window.dataApp.toggleSQLFilter()">
                    🔧 Advanced Filtering
                    <span class="toggle-icon">▼</span>
                </button>

                <div class="sql-section ${this.sqlFilterExpanded ? 'expanded' : 'collapsed'}">
                    <div class="filter-tabs">
                        <button class="filter-tab ${this.activeFilterTab === 'simple' ? 'active' : ''}" onclick="window.dataApp.toggleFilterTab('simple')">
                            🎯 Simple Filter
                        </button>
                        <button class="filter-tab ${this.activeFilterTab === 'advanced' ? 'active' : ''}" onclick="window.dataApp.toggleFilterTab('advanced')">
                            ⚡ SQL Expert
                        </button>
                    </div>

                    <div class="filter-content ${this.activeFilterTab === 'simple' ? 'active' : ''}">
                        ${this.renderSimpleFilterBuilder()}
                    </div>

                    <div class="filter-content ${this.activeFilterTab === 'advanced' ? 'active' : ''}">
                        ${this.renderAdvancedFilter()}
                    </div>
                    
                    <div class="export-section">
                        <span class="export-label">Export:</span>
                        ${this.showMultipleDatasets ? 
                            availableDatasets.map(dataset => {
                                const info = this.datasetInfo[dataset] || {};
                                return `<button class="export-btn" onclick="window.dataApp.exportDataset('${dataset}')">
                                    📥 ${info.name || dataset} CSV
                                </button>`;
                            }).join('') :
                            `<button class="export-btn" onclick="window.dataApp.exportDataset('${this.currentDataset}')">
                                📥 Export Current Table CSV
                            </button>`
                        }
                    </div>
                </div>
            </div>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${totalOriginalRecords}</div>
                    <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalFilteredRecords}</div>
                    <div class="stat-label">Filtered Results</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.showMultipleDatasets ? availableDatasets.length : 1}</div>
                    <div class="stat-label">${this.showMultipleDatasets ? 'Datasets' : 'Dataset'}</div>
                </div>
            </div>

            ${this.showMultipleDatasets ? this.renderAllDataTables() : this.renderSingleDataTable()}
        </div>
    `;
};

DataApp.prototype.renderSimpleFilterBuilder = function() {
    const headers = this.headers[this.currentDataset] || [];
    const selectedColumns = this.selectedColumns[this.currentDataset] || [];
    const operators = this.getOperatorOptions();

    return `
        <div class="simple-filter-builder">
            <button class="column-selector-toggle" onclick="window.dataApp.toggleColumnSelector()">
                ${this.showColumnSelector ? '▼ Hide' : '▶ Show'} Column Selector
            </button>
            
            ${this.showColumnSelector ? `
                <div class="column-selector">
                    <h4>Select Columns to Display:</h4>
                    <div class="column-checkboxes">
                        ${headers.map(header => `
                            <label>
                                <input type="checkbox" 
                                       value="${header}"
                                       ${selectedColumns.includes(header) ? 'checked' : ''}
                                       onchange="window.dataApp.updateSelectedColumns('${header}', this.checked)">
                                ${header}
                            </label>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="filter-conditions">
                ${this.simpleConditions.map((condition, index) => `
                    <div class="filter-condition">
                        <select onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'column', this.value)">
                            ${headers.map(header => 
                                `<option value="${header}" ${condition.column === header ? 'selected' : ''}>${header}</option>`
                            ).join('')}
                        </select>
                        
                        <select onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'operator', this.value)">
                            ${operators.map(op => 
                                `<option value="${op.value}" ${condition.operator === op.value ? 'selected' : ''}>${op.label}</option>`
                            ).join('')}
                        </select>
                        
                        ${['IS NULL', 'IS NOT NULL'].includes(condition.operator) ? '' : `
                            <input type="text" 
                                   placeholder="${this.getPlaceholderForOperator(condition.operator)}"
                                   value="${condition.value}"
                                   onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'value', this.value)">
                        `}
                        
                        <button class="condition-remove" onclick="window.dataApp.removeSimpleCondition(${condition.id})">
                            ✕
                        </button>
                    </div>
                    
                    ${index < this.simpleConditions.length - 1 ? `
                        <div class="condition-logic">
                            <span style="font-size: 12px; color: #6c757d;">Logic:</span>
                            <select onchange="window.dataApp.updateSimpleCondition(${this.simpleConditions[index + 1].id}, 'logic', this.value)">
                                <option value="AND" ${this.simpleConditions[index + 1].logic === 'AND' ? 'selected' : ''}>AND</option>
                                <option value="OR" ${this.simpleConditions[index + 1].logic === 'OR' ? 'selected' : ''}>OR</option>
                            </select>
                        </div>
                    ` : ''}
                `).join('')}
            </div>
            
            <button class="add-condition-btn" onclick="window.dataApp.addSimpleCondition()">
                ➕ Add Condition
            </button>
            
            ${this.simpleConditions.length > 0 ? `
                <div class="preview-label">Generated SQL:</div>
                <div class="preview-sql">${this.sqlQuery || 'No conditions set'}</div>
            ` : `
                <div style="text-align: center; padding: 20px; color: #6c757d; font-style: italic;">
                    Click "Add Condition" to start building your filter
                </div>
            `}
            
            <div class="simple-filter-controls">
                <button class="execute-btn" onclick="window.dataApp.executeSQL()">▶️ Apply Filter</button>
                <button class="clear-btn" onclick="window.dataApp.clearSimpleFilters()">🗑️ Clear All</button>
            </div>
        </div>
    `;
};

DataApp.prototype.renderAdvancedFilter = function() {
    return `
        <div class="advanced-filter">
            <textarea class="sql-input" placeholder="Enter SQL WHERE clause for ${this.showMultipleDatasets ? 'all datasets' : (this.datasetInfo[this.currentDataset]?.name || this.currentDataset)} (e.g., WHERE Status = 'Active' AND Amount > 50000)">${this.sqlQuery}</textarea>
            <div class="sql-controls">
                ${(this.headers[this.currentDataset] || []).map(header => 
                    `<button class="column-btn" data-column="${header}">${header}</button>`
                ).join('')}
                <button class="execute-btn" onclick="window.dataApp.executeSQL()">▶️ Execute</button>
                <button class="clear-btn" onclick="window.dataApp.clearFilters()">🗑️ Clear</button>
            </div>
        </div>
    `;
};

DataApp.prototype.getPlaceholderForOperator = function(operator) {
    const placeholders = {
        '=': 'Enter exact value',
        '!=': 'Enter value to exclude',
        '>': 'Enter number',
        '<': 'Enter number',
        '>=': 'Enter minimum value',
        '<=': 'Enter maximum value',
        'LIKE': 'Enter text to search',
        'NOT LIKE': 'Enter text to exclude',
        'STARTS WITH': 'Enter starting text',
        'ENDS WITH': 'Enter ending text',
        'IN': 'Enter values separated by commas',
        'NOT IN': 'Enter values to exclude (comma-separated)',
        'IS NULL': '',
        'IS NOT NULL': ''
    };
    return placeholders[operator] || 'Enter value';
};

DataApp.prototype.renderSingleDataTable = function() {
    const dataset = this.currentDataset;
    const data = this.filteredData[dataset] || [];
    const originalData = this.originalData[dataset] || [];
    const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
    const info = this.datasetInfo[dataset] || {};
    
    return `
        <div class="data-section">
            <div class="data-section-header">
                <h2 class="data-section-title">
                    ${info.emoji || '📄'} ${info.name || dataset} Dataset
                </h2>
                <div class="data-section-stats">
                    <div class="mini-stat">
                        <div class="mini-stat-number">${originalData.length}</div>
                        <div class="mini-stat-label">Total</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-number">${data.length}</div>
                        <div class="mini-stat-label">Shown</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-number">${headers.length}</div>
                        <div class="mini-stat-label">Columns</div>
                    </div>
                </div>
            </div>
            
            ${info.description ? `<p style="color: #666; margin-bottom: 15px; font-style: italic;">${info.description}</p>` : ''}
            
            ${data.length > 0 ? this.renderDataTable(data, headers, dataset) : this.renderNoResults(dataset)}
        </div>
    `;
};

DataApp.prototype.renderAllDataTables = function() {
    return Object.keys(this.originalData).map(dataset => {
        const data = this.filteredData[dataset] || [];
        const originalData = this.originalData[dataset] || [];
        const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
        const info = this.datasetInfo[dataset] || {};
        
        return `
            <div class="data-section">
                <div class="data-section-header">
                    <h2 class="data-section-title">
                        ${info.emoji || '📄'} ${info.name || dataset} Dataset
                    </h2>
                    <div class="data-section-stats">
                        <div class="mini-stat">
                            <div class="mini-stat-number">${originalData.length}</div>
                            <div class="mini-stat-label">Total</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-number">${data.length}</div>
                            <div class="mini-stat-label">Shown</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-number">${headers.length}</div>
                            <div class="mini-stat-label">Columns</div>
                        </div>
                    </div>
                </div>
                
                ${info.description ? `<p style="color: #666; margin-bottom: 15px; font-style: italic;">${info.description}</p>` : ''}
                
                ${data.length > 0 ? this.renderDataTable(data, headers, dataset) : this.renderNoResults(dataset)}
            </div>
        `;
    }).join('');
};

DataApp.prototype.renderDataTable = function(data, headers, dataset) {
    const searchTermToUse = this.searchTerm;
    // Detect if this is the data3 (Links) dataset and has a Link column
    const isLinksDataset = dataset === 'data3Links' && headers.includes('Link');
    // Detect if this is the data2 (Images) dataset and has an Image column
    const isImagesDataset = dataset === 'data2Images' && headers.includes('Image');
    if (isImagesDataset) {
        // Render as image cards with expandable functionality (no modal here)
        return `<div class="image-card-grid">
            ${data.map(row => `
                <div class="image-card">
                    <img src="${row['Image']}" alt="${row['Title'] || ''}" class="image-card-img expandable-img" data-fullsrc="${row['Image']}" />
                    <div class="image-card-title">${row['Title'] || ''}</div>
                    <div class="image-card-desc">${row['Description'] || ''}</div>
                </div>
            `).join('')}
        </div>`;
    }
    return `
        <div class="data-table">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${headers.map(header => `<th title="${header}">${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((row, index) => `
                            <tr data-row-index="${index}">
                                ${headers.map(header => {
                                    let cellValue = row[header] || '';
                                    let highlightedValue = window.searchEngine.highlight(cellValue, searchTermToUse);
                                    // If this is the Link column in data3, render as clickable link
                                    if (isLinksDataset && header === 'Link' && cellValue) {
                                        // If it's a PDF, open in new tab
                                        if (cellValue.endsWith('.pdf')) {
                                            highlightedValue = `<a href="${cellValue}" target="_blank" rel="noopener noreferrer">Open PDF</a>`;
                                        } else {
                                            highlightedValue = `<a href="${cellValue}" target="_blank" rel="noopener noreferrer">${cellValue}</a>`;
                                        }
                                    }
                                    return `<td title="${cellValue}" data-column="${header}">${highlightedValue}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

DataApp.prototype.renderNoResults = function(dataset) {
    const info = this.datasetInfo[dataset] || {};
    return `
        <div class="data-table">
            <div class="no-results">
                <h3>📭 No Results Found in ${info.name || dataset}</h3>
                <p>Try adjusting your search criteria or SQL filter</p>
            </div>
        </div>
    `;
};

// Add/replace attachEventListeners to support image expand
DataApp.prototype.attachEventListeners = function() {
    // Expandable images using Fullscreen API
    document.querySelectorAll('.expandable-img').forEach(img => {
        img.addEventListener('click', function() {
            if (this.requestFullscreen) {
                this.requestFullscreen();
            } else if (this.webkitRequestFullscreen) { /* Safari */
                this.webkitRequestFullscreen();
            } else if (this.msRequestFullscreen) { /* IE11 */
                this.msRequestFullscreen();
            }
        });
    });
};