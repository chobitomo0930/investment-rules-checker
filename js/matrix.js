// マトリクス表示管理
const Matrix = {
    // マトリクステーブルを生成
    generateTable(market, config, data) {
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
        let vixRanges, colRanges, matrixValues, colLabel;
        
        if (market === 'us') {
            vixRanges = config.us.vixRanges;
            colRanges = config.us.forexRanges;
            matrixValues = config.us.matrixValues;
            colLabel = 'USD/JPY';
        } else {
            vixRanges = config.jp.vixRanges;
            colRanges = config.jp.nikkeiviRanges;
            matrixValues = config.jp.matrixValues;
            colLabel = '日経VI';
        }
        
        // ヘッダー行
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        
        // 左上のセル
        const emptyCell = document.createElement('th');
        emptyCell.textContent = 'VIX \\ ' + colLabel;
        headerRow.appendChild(emptyCell);
        
        // 列ヘッダー
        colRanges.forEach(range => {
            const th = document.createElement('th');
            th.textContent = range.label || `${range.min}-${range.max}`;
            headerRow.appendChild(th);
        });
        
        // データ行
        const tbody = table.createTBody();
        vixRanges.forEach((vixRange, rowIndex) => {
            const row = tbody.insertRow();
            
            // 行ヘッダー
            const th = document.createElement('th');
            th.textContent = vixRange.label || `${vixRange.min}-${vixRange.max}`;
            row.appendChild(th);
            
            // データセル
            colRanges.forEach((colRange, colIndex) => {
                const td = row.insertCell();
                const value = matrixValues[rowIndex] && matrixValues[rowIndex][colIndex] 
                    ? matrixValues[rowIndex][colIndex] 
                    : '';
                
                td.textContent = value;
                
                // 現在の値に該当するセルをハイライト
                if (data && this.isInRange(data, market, vixRange, colRange)) {
                    td.classList.add('highlight');
                }
            });
        });
        
        return table;
    },

    // 現在の値が範囲内かチェック
    isInRange(data, market, vixRange, colRange) {
        if (!data.vix) return false;
        
        const vixInRange = data.vix >= vixRange.min && data.vix <= vixRange.max;
        
        if (market === 'us') {
            if (!data.usdjpy) return false;
            return vixInRange && data.usdjpy >= colRange.min && data.usdjpy <= colRange.max;
        } else {
            if (!data.nikkeiVi) return false;
            return vixInRange && data.nikkeiVi >= colRange.min && data.nikkeiVi <= colRange.max;
        }
    },

    // マトリクス入力テーブルを生成（設定画面用）
    generateInputTable(market, config) {
        console.log('📊 generateInputTable 呼び出し - market:', market);
        console.log('📊 config:', config);
        
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
        let vixRanges, colRanges, matrixValues, colLabel;
        
        if (market === 'us') {
            vixRanges = config.us.vixRanges;
            colRanges = config.us.forexRanges;
            matrixValues = config.us.matrixValues;
            colLabel = 'USD/JPY';
        } else {
            vixRanges = config.jp.vixRanges;
            colRanges = config.jp.nikkeiviRanges;
            matrixValues = config.jp.matrixValues;
            colLabel = '日経VI';
        }
        
        console.log('📊 matrixValues:', matrixValues);
        console.log('📊 vixRanges.length:', vixRanges.length);
        console.log('📊 colRanges.length:', colRanges.length);
        
        // ヘッダー行
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        
        // 左上のセル
        const emptyCell = document.createElement('th');
        emptyCell.textContent = 'VIX \\ ' + colLabel;
        headerRow.appendChild(emptyCell);
        
        // 列ヘッダー
        colRanges.forEach(range => {
            const th = document.createElement('th');
            th.textContent = range.label || `${range.min}-${range.max}`;
            headerRow.appendChild(th);
        });
        
        // データ行
        const tbody = table.createTBody();
        vixRanges.forEach((vixRange, rowIndex) => {
            const row = tbody.insertRow();
            
            // 行ヘッダー
            const th = document.createElement('th');
            th.textContent = vixRange.label || `${vixRange.min}-${vixRange.max}`;
            row.appendChild(th);
            
            // 入力セル
            colRanges.forEach((colRange, colIndex) => {
                const td = row.insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                
                const existingValue = matrixValues[rowIndex] && matrixValues[rowIndex][colIndex] 
                    ? matrixValues[rowIndex][colIndex] 
                    : '';
                
                if (existingValue) {
                    console.log(`  ✅ セル[${rowIndex}][${colIndex}]に既存値を設定: "${existingValue}"`);
                } else {
                    console.log(`  ⚠️ セル[${rowIndex}][${colIndex}]は空です`);
                }
                
                input.value = existingValue;
                input.dataset.row = rowIndex;
                input.dataset.col = colIndex;
                input.dataset.market = market;
                
                input.addEventListener('change', (e) => {
                    this.updateMatrixValue(e.target);
                });
                
                td.appendChild(input);
            });
        });
        
        return table;
    },

    // マトリクスの値を更新
    updateMatrixValue(input) {
        const market = input.dataset.market;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = input.value;
        
        if (market === 'us') {
            if (!currentConfig.us.matrixValues[row]) {
                currentConfig.us.matrixValues[row] = [];
            }
            currentConfig.us.matrixValues[row][col] = value;
        } else {
            if (!currentConfig.jp.matrixValues[row]) {
                currentConfig.jp.matrixValues[row] = [];
            }
            currentConfig.jp.matrixValues[row][col] = value;
        }
    },

    // 簡略化された表示（VIX、USD/JPY、該当値のみ）
    displaySimplifiedView(data, market, config) {
        const container = document.getElementById('currentValues');
        container.innerHTML = '';
        
        if (!data || !data.vix) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">データ取得中...</p>';
            return;
        }

        // 大きなカードコンテナを作成
        const mainCard = document.createElement('div');
        mainCard.style.cssText = 'background: var(--card-bg); border-radius: 16px; padding: 32px; box-shadow: var(--shadow-md); text-align: center;';
        
        // 第1行: VIX指数とUSD/JPY（横並び）
        const indicatorsRow = document.createElement('div');
        indicatorsRow.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 48px; margin-bottom: 32px; flex-wrap: wrap;';
        
        // VIX表示
        const vixSection = document.createElement('div');
        vixSection.innerHTML = `
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">📊 VIX指数</div>
            <div style="font-size: 32px; font-weight: 700; color: var(--primary-color);">${data.vix}</div>
            ${data.sources?.vix ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${data.sources.vix}</div>` : ''}
        `;
        indicatorsRow.appendChild(vixSection);
        
        // USD/JPY表示（米国株の場合）
        if (market === 'us' && data.usdjpy) {
            const forexSection = document.createElement('div');
            forexSection.innerHTML = `
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">💵 USD/JPY</div>
                <div style="font-size: 32px; font-weight: 700; color: var(--primary-color);">${data.usdjpy}</div>
                ${data.sources?.usdjpy ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${data.sources.usdjpy}</div>` : ''}
            `;
            indicatorsRow.appendChild(forexSection);
        }
        
        mainCard.appendChild(indicatorsRow);
        
        // 区切り線
        const divider = document.createElement('div');
        divider.style.cssText = 'height: 2px; background: var(--border-color); margin: 24px 0;';
        mainCard.appendChild(divider);
        
        // 第2行: 現在の推奨ルール
        const recommendedValue = this.getRecommendedValue(data, market, config);
        if (recommendedValue) {
            const recommendSection = document.createElement('div');
            recommendSection.style.cssText = 'margin-top: 24px;';
            recommendSection.innerHTML = `
                <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 12px;">💡 現在の推奨ルール</div>
                <div style="font-size: 64px; font-weight: 700; color: var(--secondary-color); line-height: 1.3; white-space: pre-line;">${recommendedValue}</div>
            `;
            mainCard.appendChild(recommendSection);
        }
        
        container.appendChild(mainCard);
        
        // データ取得失敗の警告
        if (data.isDemo || (!data.vix || (market === 'us' && !data.usdjpy))) {
            const warning = document.createElement('div');
            warning.style.cssText = 'margin-top: 16px; padding: 16px; background: #fee2e2; border-radius: 12px; text-align: center; font-size: 14px; color: #991b1b;';
            warning.innerHTML = '⚠️ 一部データの取得に失敗しました<br>「✏️ 手動入力」または「🔄 最新データ取得」を試してください';
            container.appendChild(warning);
        }
    },
    
    // 該当するマトリクスの値を取得
    getRecommendedValue(data, market, config) {
        if (!data.vix) return null;
        
        let vixRanges, colRanges, matrixValues;
        let colValue;
        
        if (market === 'us') {
            if (!data.usdjpy) return null;
            vixRanges = config.us.vixRanges;
            colRanges = config.us.forexRanges;
            matrixValues = config.us.matrixValues;
            colValue = data.usdjpy;
        } else {
            if (!data.nikkeiVi) return null;
            vixRanges = config.jp.vixRanges;
            colRanges = config.jp.nikkeiviRanges;
            matrixValues = config.jp.matrixValues;
            colValue = data.nikkeiVi;
        }
        
        console.log('🔍 推奨ルール計算デバッグ:');
        console.log('  現在のVIX:', data.vix);
        console.log('  現在の列値:', colValue, `(${market === 'us' ? 'USD/JPY' : '日経VI'})`);
        console.log('  VIX範囲:', vixRanges);
        console.log('  列範囲:', colRanges);
        console.log('  マトリクス値:', matrixValues);
        
        // VIXの範囲を見つける
        const vixIndex = vixRanges.findIndex(range => 
            data.vix >= range.min && data.vix <= range.max
        );
        
        // 列の範囲を見つける
        const colIndex = colRanges.findIndex(range => 
            colValue >= range.min && colValue <= range.max
        );
        
        console.log('  VIXインデックス:', vixIndex);
        console.log('  列インデックス:', colIndex);
        
        if (vixIndex !== -1 && colIndex !== -1) {
            const value = matrixValues[vixIndex] && matrixValues[vixIndex][colIndex] 
                ? matrixValues[vixIndex][colIndex] 
                : '設定なし';
            console.log('  ✅ 該当する値:', value);
            return value;
        }
        
        console.log('  ❌ 範囲外');
        return '範囲外';
    },

    // 現在の指標値を表示（従来の詳細表示）
    displayCurrentValues(data, market) {
        const container = document.getElementById('currentValues');
        container.innerHTML = '';
        
        if (!data || !data.vix) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">データを取得してください</p>';
            return;
        }
        
        // VIX
        const vixCard = this.createValueCard('VIX指数', data.vix, '📊', data.sources?.vix);
        container.appendChild(vixCard);
        
        if (market === 'us' || market === 'both') {
            // USD/JPY
            const forexCard = this.createValueCard('USD/JPY', data.usdjpy, '💵', data.sources?.usdjpy);
            container.appendChild(forexCard);
        }
        
        if (market === 'jp' || market === 'both') {
            // 日経VI
            const viCard = this.createValueCard('日経VI', data.nikkeiVi, '📈', data.sources?.nikkeiVi);
            container.appendChild(viCard);
        }
        
        // データ取得失敗の警告（市場選択に応じて必要なデータをチェック）
        const missingItems = [];
        if (!data.vix) missingItems.push('VIX');
        
        if (market === 'us' || market === 'both') {
            if (!data.usdjpy) missingItems.push('USD/JPY');
        }
        
        if (market === 'jp' || market === 'both') {
            if (!data.nikkeiVi) missingItems.push('日経VI');
        }
        
        if (data.isDemo || missingItems.length > 0) {
            const warning = document.createElement('div');
            warning.style.cssText = 'grid-column: 1 / -1; padding: 12px; background: #fee2e2; border-radius: 8px; text-align: center; font-size: 12px; color: #991b1b;';
            if (missingItems.length > 0) {
                warning.innerHTML = `⚠️ ${missingItems.join('、')}のデータ取得に失敗しました<br>「✏️ 手動入力」ボタンから値を入力してください`;
            } else {
                warning.innerHTML = '⚠️ データ取得に失敗しました<br>「✏️ 手動入力」ボタンから値を入力してください';
            }
            container.appendChild(warning);
        } else if (data.isEstimated) {
            const warning = document.createElement('div');
            warning.style.cssText = 'grid-column: 1 / -1; padding: 12px; background: #dbeafe; border-radius: 8px; text-align: center; font-size: 12px; color: #1e40af;';
            warning.textContent = 'ℹ️ 日経VIは推定値または代替指標を使用しています';
            container.appendChild(warning);
        }
        
        // データソース情報を表示
        if (data.sources && !data.isDemo) {
            const sourceInfo = document.createElement('div');
            sourceInfo.style.cssText = 'grid-column: 1 / -1; padding: 8px; background: #f1f5f9; border-radius: 8px; text-align: center; font-size: 11px; color: #64748b;';
            const sources = Object.entries(data.sources)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' | ');
            sourceInfo.textContent = `データソース: ${sources}`;
            container.appendChild(sourceInfo);
        }
    },

    // 値カードを作成
    createValueCard(label, value, icon, source) {
        const card = document.createElement('div');
        card.className = 'value-card';
        
        const sourceText = source ? `<div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">${source}</div>` : '';
        const displayValue = (value !== null && value !== undefined) ? value : '--';
        const valueStyle = (value === null || value === undefined) ? 'color: var(--danger-color);' : '';
        
        card.innerHTML = `
            <div class="value-label">${icon} ${label}</div>
            <div class="value-number" style="${valueStyle}">${displayValue}</div>
            ${sourceText}
        `;
        
        return card;
    }
};
