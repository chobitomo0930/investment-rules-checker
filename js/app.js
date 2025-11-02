// メインアプリケーションロジック

// 画面遷移
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showSetup() {
    try {
        console.log('⚙️ showSetup 呼び出し');
        
        // currentConfigが正しく設定されているか確認
        console.log('showSetup: 現在の設定:', currentConfig);
        
        if (!currentConfig) {
            console.error('currentConfigがnullです。再初期化します。');
            currentConfig = getDefaultConfig();
            Storage.saveConfig(currentConfig);
        }
        
        // 設定画面を初期化
        initSetupScreen();
        showScreen('setupScreen');
        
        console.log('✅ showSetup 完了');
    } catch (error) {
        console.error('❌ showSetup エラー:', error);
        alert('設定画面の表示中にエラーが発生しました: ' + error.message);
    }
}

function showMatrix() {
    showScreen('matrixScreen');
}

// ローディング表示
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// 初期化フラグ
let isInitialized = false;

// 初期化
async function init() {
    // 重複初期化を防ぐ
    if (isInitialized) {
        console.log('⚠️ 初期化済みのためスキップ');
        return;
    }
    isInitialized = true;
    
    try {
        console.log('🚀 アプリケーション初期化開始');
        
        // 保存された設定を読み込み（なければデフォルト設定を使用）
        const savedConfig = Storage.loadConfig();
        const savedData = Storage.loadData();
        
        if (savedConfig && savedConfig.us && savedConfig.jp) {
            currentConfig = savedConfig;
            console.log('✅ 保存された設定を読み込みました:', currentConfig);
        } else {
            // デフォルト設定を使用
            console.log('📝 デフォルト設定を使用します');
            currentConfig = getDefaultConfig();
            Storage.saveConfig(currentConfig);
        }
        
        if (savedData) {
            currentData = savedData;
        }
        
        console.log('🎯 currentConfig最終確認:', currentConfig);
        
        // マトリクス画面を表示
        setupMatrixScreen();
        showMatrix();
        
        // 自動的にデータ取得を実行
        await fetchLatestData();
        
        // 市場選択の変更イベント
        document.querySelectorAll('input[name="market"]').forEach(radio => {
            radio.addEventListener('change', handleMarketChange);
        });
        
        console.log('✅ アプリケーション初期化完了');
    } catch (error) {
        console.error('❌ アプリケーション初期化エラー:', error);
        alert('アプリケーションの初期化中にエラーが発生しました: ' + error.message);
        isInitialized = false; // エラー時はリトライ可能に
    }
}

// 初期設定画面の初期化
function initSetupScreen() {
    console.log('🔧 initSetupScreen 呼び出し');
    
    // currentConfigが正しく初期化されているか確認
    if (!currentConfig || !currentConfig.us || !currentConfig.jp) {
        console.error('currentConfigが正しく初期化されていません:', currentConfig);
        currentConfig = getDefaultConfig();
        Storage.saveConfig(currentConfig);
    }
    
    console.log('📋 現在の設定:', currentConfig);
    
    // 米国株設定セクションを再構築
    const usSetup = document.getElementById('usSetup');
    if (usSetup) {
        usSetup.innerHTML = `
            <h2 class="section-title">🇺🇸 米国株マトリクス設定</h2>
            
            <div class="matrix-config">
                <h3 class="config-title">VIX範囲設定（縦軸）</h3>
                <div id="usVixRows"></div>
                <button class="btn-add" onclick="addVixRow('us')">+ VIX範囲を追加</button>

                <h3 class="config-title mt-3">為替（USD/JPY）範囲設定（横軸）</h3>
                <div id="usForexCols"></div>
                <button class="btn-add" onclick="addForexCol('us')">+ 為替範囲を追加</button>
            </div>
        `;
    }
    
    // 日本株設定セクションを再構築
    const jpSetup = document.getElementById('jpSetup');
    if (jpSetup) {
        jpSetup.innerHTML = `
            <h2 class="section-title">🇯🇵 日本株マトリクス設定</h2>
            
            <div class="matrix-config">
                <h3 class="config-title">VIX範囲設定（縦軸）</h3>
                <div id="jpVixRows"></div>
                <button class="btn-add" onclick="addVixRow('jp')">+ VIX範囲を追加</button>

                <h3 class="config-title mt-3">日経VI範囲設定（横軸）</h3>
                <div id="jpViCols"></div>
                <button class="btn-add" onclick="addViCol('jp')">+ 日経VI範囲を追加</button>
            </div>
        `;
    }
    
    // DOM要素の存在確認
    const usVixRows = document.getElementById('usVixRows');
    const usForexCols = document.getElementById('usForexCols');
    const jpVixRows = document.getElementById('jpVixRows');
    const jpViCols = document.getElementById('jpViCols');
    
    if (!usVixRows || !usForexCols || !jpVixRows || !jpViCols) {
        console.error('必要なDOM要素が見つかりません');
        return;
    }
    
    // 既存のフィールドをクリア（既に空のはず）
    usVixRows.innerHTML = '';
    usForexCols.innerHTML = '';
    jpVixRows.innerHTML = '';
    jpViCols.innerHTML = '';
    
    // 現在の設定を読み込んで表示
    const config = currentConfig;
    
    // 米国株の設定
    console.log(`📝 米国株VIX範囲を${config.us.vixRanges.length}個追加`);
    config.us.vixRanges.forEach(() => addVixRow('us'));
    console.log(`📝 米国株為替範囲を${config.us.forexRanges.length}個追加`);
    config.us.forexRanges.forEach(() => addForexCol('us'));
    
    // 日本株の設定
    console.log(`📝 日本株VIX範囲を${config.jp.vixRanges.length}個追加`);
    config.jp.vixRanges.forEach(() => addVixRow('jp'));
    console.log(`📝 日本株VI範囲を${config.jp.nikkeiviRanges.length}個追加`);
    config.jp.nikkeiviRanges.forEach(() => addViCol('jp'));
    
    // 現在の値を設定
    console.log('📝 現在の値を入力フィールドに設定');
    populateCurrentValues('us');
    populateCurrentValues('jp');
    
    // 市場選択を反映
    console.log(`📝 市場選択: ${config.market}`);
    document.querySelector(`input[name="market"][value="${config.market}"]`).checked = true;
    handleMarketChangeByValue(config.market);
    
    console.log('✅ initSetupScreen 完了');
}

// 現在の値を入力フィールドに設定
function populateCurrentValues(market) {
    const config = currentConfig;
    
    if (market === 'us') {
        // VIX範囲
        const vixInputs = document.querySelectorAll('#usVixRows .range-input-group');
        config.us.vixRanges.forEach((range, index) => {
            if (vixInputs[index]) {
                vixInputs[index].querySelector('input[placeholder="最小値"]').value = range.min;
                vixInputs[index].querySelector('input[placeholder="最大値"]').value = range.max;
                vixInputs[index].querySelector('input[placeholder="ラベル"]').value = range.label;
            }
        });
        
        // 為替範囲
        const forexInputs = document.querySelectorAll('#usForexCols .range-input-group');
        config.us.forexRanges.forEach((range, index) => {
            if (forexInputs[index]) {
                forexInputs[index].querySelector('input[placeholder="最小値"]').value = range.min;
                forexInputs[index].querySelector('input[placeholder="最大値"]').value = range.max;
                forexInputs[index].querySelector('input[placeholder="ラベル"]').value = range.label;
            }
        });
    } else {
        // VIX範囲
        const vixInputs = document.querySelectorAll('#jpVixRows .range-input-group');
        config.jp.vixRanges.forEach((range, index) => {
            if (vixInputs[index]) {
                vixInputs[index].querySelector('input[placeholder="最小値"]').value = range.min;
                vixInputs[index].querySelector('input[placeholder="最大値"]').value = range.max;
                vixInputs[index].querySelector('input[placeholder="ラベル"]').value = range.label;
            }
        });
        
        // 日経VI範囲
        const viInputs = document.querySelectorAll('#jpViCols .range-input-group');
        config.jp.nikkeiviRanges.forEach((range, index) => {
            if (viInputs[index]) {
                viInputs[index].querySelector('input[placeholder="最小値"]').value = range.min;
                viInputs[index].querySelector('input[placeholder="最大値"]').value = range.max;
                viInputs[index].querySelector('input[placeholder="ラベル"]').value = range.label;
            }
        });
    }
}

// 市場選択の変更処理
function handleMarketChange(e) {
    const market = e.target.value;
    handleMarketChangeByValue(market);
}

// 市場選択を値で変更
function handleMarketChangeByValue(market) {
    const usSetup = document.getElementById('usSetup');
    const jpSetup = document.getElementById('jpSetup');
    
    if (market === 'us') {
        usSetup.style.display = 'block';
        jpSetup.style.display = 'none';
    } else if (market === 'jp') {
        usSetup.style.display = 'none';
        jpSetup.style.display = 'block';
    } else {
        usSetup.style.display = 'block';
        jpSetup.style.display = 'block';
    }
}

// VIX範囲の行を追加
function addVixRow(market) {
    const containerId = market === 'us' ? 'usVixRows' : 'jpVixRows';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`❌ Container not found: ${containerId}`);
        return;
    }
    
    const count = container.children.length;
    if (count >= CONFIG.MAX_ROWS) {
        alert(`VIX範囲は最大${CONFIG.MAX_ROWS}つまでです`);
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'range-input-group';
    div.innerHTML = `
        <input type="number" placeholder="最小値" step="0.01">
        <span class="range-separator">～</span>
        <input type="number" placeholder="最大値" step="0.01">
        <input type="text" placeholder="ラベル" style="flex: 1.5;">
        <button class="btn-remove" onclick="removeRow(this)">削除</button>
    `;
    
    container.appendChild(div);
}

// 為替範囲の列を追加
function addForexCol(market) {
    const containerId = market === 'us' ? 'usForexCols' : null;
    if (!containerId) return;
    
    const container = document.getElementById(containerId);
    const count = container.children.length;
    if (count >= CONFIG.MAX_COLS) {
        alert(`為替範囲は最大${CONFIG.MAX_COLS}つまでです`);
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'range-input-group';
    div.innerHTML = `
        <input type="number" placeholder="最小値" step="0.01">
        <span class="range-separator">～</span>
        <input type="number" placeholder="最大値" step="0.01">
        <input type="text" placeholder="ラベル" style="flex: 1.5;">
        <button class="btn-remove" onclick="removeRow(this)">削除</button>
    `;
    
    container.appendChild(div);
}

// 日経VI範囲の列を追加
function addViCol(market) {
    const containerId = market === 'jp' ? 'jpViCols' : null;
    if (!containerId) return;
    
    const container = document.getElementById(containerId);
    const count = container.children.length;
    if (count >= CONFIG.MAX_COLS) {
        alert(`日経VI範囲は最大${CONFIG.MAX_COLS}つまでです`);
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'range-input-group';
    div.innerHTML = `
        <input type="number" placeholder="最小値" step="0.01">
        <span class="range-separator">～</span>
        <input type="number" placeholder="最大値" step="0.01">
        <input type="text" placeholder="ラベル" style="flex: 1.5;">
        <button class="btn-remove" onclick="removeRow(this)">削除</button>
    `;
    
    container.appendChild(div);
}

// 行を削除
function removeRow(button) {
    button.parentElement.remove();
}

// 設定を保存
function saveSetup() {
    const market = document.querySelector('input[name="market"]:checked').value;
    
    // 米国株の設定を収集
    if (market === 'us' || market === 'both') {
        currentConfig.us.vixRanges = collectRanges('usVixRows');
        currentConfig.us.forexRanges = collectRanges('usForexCols');
        
        console.log('収集したVIX範囲:', currentConfig.us.vixRanges);
        console.log('収集した為替範囲:', currentConfig.us.forexRanges);
        
        if (currentConfig.us.vixRanges.length === 0 || currentConfig.us.forexRanges.length === 0) {
            alert('米国株のVIXと為替の範囲を少なくとも1つずつ設定してください');
            return;
        }
        
        // マトリクス値の初期化（既存の値を保持）
        console.log('💾 保存前の米国株マトリクス値:', currentConfig.us.matrixValues);
        const existingUsMatrixValues = currentConfig.us.matrixValues || CONFIG.DEFAULT_MATRIX_VALUES.us;
        console.log('💾 使用するデフォルト値:', existingUsMatrixValues);
        currentConfig.us.matrixValues = initMatrixValues(
            currentConfig.us.vixRanges.length,
            currentConfig.us.forexRanges.length,
            existingUsMatrixValues
        );
        console.log('💾 保存後の米国株マトリクス値:', currentConfig.us.matrixValues);
    }
    
    // 日本株の設定を収集
    if (market === 'jp' || market === 'both') {
        currentConfig.jp.vixRanges = collectRanges('jpVixRows');
        currentConfig.jp.nikkeiviRanges = collectRanges('jpViCols');
        
        if (currentConfig.jp.vixRanges.length === 0 || currentConfig.jp.nikkeiviRanges.length === 0) {
            alert('日本株のVIXと日経VIの範囲を少なくとも1つずつ設定してください');
            return;
        }
        
        // マトリクス値の初期化（既存の値を保持）
        console.log('💾 保存前の日本株マトリクス値:', currentConfig.jp.matrixValues);
        const existingJpMatrixValues = currentConfig.jp.matrixValues || CONFIG.DEFAULT_MATRIX_VALUES.jp;
        console.log('💾 使用するデフォルト値:', existingJpMatrixValues);
        currentConfig.jp.matrixValues = initMatrixValues(
            currentConfig.jp.vixRanges.length,
            currentConfig.jp.nikkeiviRanges.length,
            existingJpMatrixValues
        );
        console.log('💾 保存後の日本株マトリクス値:', currentConfig.jp.matrixValues);
    }
    
    currentConfig.market = market;
    
    // マトリクス値入力画面を表示
    showMatrixValueInput();
}

// 範囲設定を収集
function collectRanges(containerId) {
    const container = document.getElementById(containerId);
    const ranges = [];
    
    container.querySelectorAll('.range-input-group').forEach(group => {
        const inputs = group.querySelectorAll('input');
        const min = parseFloat(inputs[0].value);
        const max = parseFloat(inputs[1].value);
        const label = inputs[2].value;
        
        if (!isNaN(min) && !isNaN(max)) {
            ranges.push({ min, max, label });
        }
    });
    
    return ranges;
}

// マトリクス値の初期化
function initMatrixValues(rows, cols, defaults) {
    console.log(`🔄 initMatrixValues: rows=${rows}, cols=${cols}`);
    console.log('🔄 defaults:', defaults);
    
    const values = [];
    for (let i = 0; i < rows; i++) {
        values[i] = [];
        for (let j = 0; j < cols; j++) {
            const defaultValue = (defaults && defaults[i] && defaults[i][j]) ? defaults[i][j] : '';
            values[i][j] = defaultValue;
            if (defaultValue) {
                console.log(`  ✅ [${i}][${j}] = "${defaultValue}"`);
            }
        }
    }
    
    console.log('🔄 生成されたvalues:', values);
    return values;
}

// マトリクス値入力画面を表示
function showMatrixValueInput() {
    console.log('📝 showMatrixValueInput 呼び出し');
    const market = currentConfig.market;
    
    // 米国株と日本株のセクションを表示/非表示
    const usSetup = document.getElementById('usMatrixValueSetup');
    const jpSetup = document.getElementById('jpMatrixValueSetup');
    
    if (market === 'us' || market === 'both') {
        const usTable = Matrix.generateInputTable('us', currentConfig);
        const usTableContainer = document.getElementById('usMatrixValueTable');
        usTableContainer.innerHTML = ''; // クリア
        usTableContainer.appendChild(usTable); // 直接挿入
        usSetup.style.display = 'block';
    } else {
        usSetup.style.display = 'none';
    }
    
    if (market === 'jp' || market === 'both') {
        const jpTable = Matrix.generateInputTable('jp', currentConfig);
        const jpTableContainer = document.getElementById('jpMatrixValueTable');
        jpTableContainer.innerHTML = ''; // クリア
        jpTableContainer.appendChild(jpTable); // 直接挿入
        jpSetup.style.display = 'block';
    } else {
        jpSetup.style.display = 'none';
    }
    
    // マトリクス値入力画面に遷移
    showScreen('matrixValueScreen');
    console.log('✅ マトリクス値入力画面を表示');
}

// 設定完了
async function finishSetup() {
    // マトリクス値を保存
    document.querySelectorAll('.matrix-table input').forEach(input => {
        Matrix.updateMatrixValue(input);
    });
    
    // 設定を保存
    Storage.saveConfig(currentConfig);
    
    // マトリクス画面を表示
    setupMatrixScreen();
    showMatrix();
    
    // 最新データを取得
    await fetchLatestData();
}

// マトリクス画面をセットアップ
function setupMatrixScreen() {
    const market = currentConfig.market;
    
    // 簡略化された表示を使用（VIX、USD/JPY、該当値のみ）
    Matrix.displaySimplifiedView(currentData, market, currentConfig);
    
    // マトリクステーブルは非表示（詳細表示は設定画面で確認可能）
    document.getElementById('usMatrix').style.display = 'none';
    document.getElementById('jpMatrix').style.display = 'none';
    
    // 最終取得日時を表示
    if (currentData.timestamp) {
        document.getElementById('lastUpdate').textContent = FinanceAPI.formatTimestamp(currentData.timestamp);
    } else {
        document.getElementById('lastUpdate').textContent = '取得中...';
    }
}

// 最新データを取得
async function fetchLatestData() {
    try {
        showLoading();
        
        // 現在の市場選択を取得
        const market = currentConfig.market || 'both';
        
        const data = await FinanceAPI.fetchAllData(market);
        currentData = data;
        
        // 画面を更新
        setupMatrixScreen();
        
        hideLoading();
        
        // データ取得状況を確認（市場選択に応じて必要なデータをチェック）
        const missingItems = [];
        if (!data.vix) missingItems.push('VIX');
        
        if (market === 'us' || market === 'both') {
            if (!data.usdjpy) missingItems.push('USD/JPY');
        }
        
        if (market === 'jp' || market === 'both') {
            if (!data.nikkeiVi) missingItems.push('日経VI');
        }
        
        if (data.isDemo || missingItems.length > 0) {
            const message = missingItems.length > 0 
                ? `⚠️ 以下のデータ取得に失敗しました:\n${missingItems.join(', ')}\n\n「✏️ 手動入力」ボタンから値を入力してください。`
                : '⚠️ データ取得に失敗しました。\n\n「✏️ 手動入力」ボタンから値を入力してください。';
            
            alert(message);
        } else if (data.isEstimated) {
            alert('✅ データ取得成功\n\nℹ️ 日経VIは推定値または代替指標を使用しています。');
        } else {
            // 成功時は特にアラートを表示しない（データソース情報で確認可能）
            console.log('データ取得成功:', data.sources);
        }
    } catch (error) {
        hideLoading();
        alert('データの取得に失敗しました: ' + error.message);
    }
}

// 手動入力モーダルを表示
function showManualInput() {
    const modal = document.getElementById('manualInputModal');
    
    // 現在の値を入力フィールドに設定
    if (currentData.vix) {
        document.getElementById('manualVix').value = currentData.vix;
    }
    if (currentData.usdjpy) {
        document.getElementById('manualUsdjpy').value = currentData.usdjpy;
    }
    if (currentData.nikkeiVi) {
        document.getElementById('manualNikkeiVi').value = currentData.nikkeiVi;
    }
    
    modal.classList.add('active');
}

// 手動入力モーダルを閉じる
function closeManualInput() {
    const modal = document.getElementById('manualInputModal');
    modal.classList.remove('active');
}

// 手動入力した値を保存
function saveManualInput() {
    const vix = parseFloat(document.getElementById('manualVix').value);
    const usdjpy = parseFloat(document.getElementById('manualUsdjpy').value);
    const nikkeiVi = parseFloat(document.getElementById('manualNikkeiVi').value);
    
    // バリデーション
    if (isNaN(vix) || vix < 0) {
        alert('VIX指数を正しく入力してください');
        return;
    }
    if (isNaN(usdjpy) || usdjpy < 0) {
        alert('USD/JPY為替レートを正しく入力してください');
        return;
    }
    if (isNaN(nikkeiVi) || nikkeiVi < 0) {
        alert('日経VIを正しく入力してください');
        return;
    }
    
    // データを更新
    currentData = {
        vix: parseFloat(vix.toFixed(2)),
        usdjpy: parseFloat(usdjpy.toFixed(2)),
        nikkeiVi: parseFloat(nikkeiVi.toFixed(2)),
        timestamp: new Date().toISOString(),
        isDemo: false,
        sources: {
            vix: '手動入力',
            usdjpy: '手動入力',
            nikkeiVi: '手動入力'
        },
        isManual: true
    };
    
    // データを保存
    Storage.saveData(currentData);
    
    // 画面を更新
    setupMatrixScreen();
    
    // モーダルを閉じる
    closeManualInput();
    
    alert('データを保存しました');
}

// APIキー設定モーダルの表示
function showApiKeyModal(isFirstTime = false) {
    console.log('🔑 showApiKeyModal 呼び出し');
    const modal = document.getElementById('apiKeyModal');
    
    if (!modal) {
        console.error('❌ APIキーモーダルが見つかりません');
        return;
    }
    
    // 既存のAPIキーを読み込んで表示
    const apiKeys = Storage.loadApiKeys() || {};
    document.getElementById('apiKeyTwelveData').value = apiKeys.TWELVE_DATA || '';
    document.getElementById('apiKeyFinnhub').value = apiKeys.FINNHUB || '';
    document.getElementById('apiKeyAlphaVantage').value = apiKeys.ALPHA_VANTAGE || '';
    
    // 初回起動時はモーダルの背景クリックで閉じないようにする
    if (isFirstTime) {
        modal.onclick = null;
    } else {
        modal.onclick = (e) => {
            if (e.target === modal) closeApiKeyModal();
        };
    }
    
    modal.classList.add('active');
}

// APIキー設定モーダルを閉じる
function closeApiKeyModal() {
    document.getElementById('apiKeyModal').classList.remove('active');
}

// APIキーを保存
function saveApiKeys() {
    const apiKeys = {
        TWELVE_DATA: document.getElementById('apiKeyTwelveData').value.trim(),
        FINNHUB: document.getElementById('apiKeyFinnhub').value.trim(),
        ALPHA_VANTAGE: document.getElementById('apiKeyAlphaVantage').value.trim()
    };
    
    // 空の値を削除
    Object.keys(apiKeys).forEach(key => {
        if (!apiKeys[key]) delete apiKeys[key];
    });
    
    // 保存
    Storage.saveApiKeys(apiKeys);
    
    // モーダルを閉じる
    closeApiKeyModal();
    
    // 通知
    if (Object.keys(apiKeys).length > 0) {
        alert('APIキーを保存しました。自動データ取得が利用可能です。');
    } else {
        alert('APIキーは保存されませんでした。手動入力モードで使用してください。');
    }
}

// APIキー設定をスキップ（初回起動時）
function skipApiKeySetup() {
    closeApiKeyModal();
    alert('APIキーなしで開始します。\n\n「手動入力」ボタンからデータを入力してください。\n\nAPIキーは設定画面からいつでも追加できます。');
}

// APIキー取得ガイドを表示
function showApiKeyGuide(provider) {
    const guides = {
        twelvedata: `
            <h3>Twelve Data APIキー取得方法</h3>
            <ol style="padding-left: 20px;">
                <li><a href="https://twelvedata.com/" target="_blank" style="color: var(--primary-color);">Twelve Data</a> にアクセス</li>
                <li>右上の「Sign Up」をクリック</li>
                <li>メールアドレスとパスワードで無料アカウントを作成</li>
                <li>ダッシュボードでAPIキーが表示されます</li>
                <li>無料プランは1日800リクエストまで利用可能</li>
            </ol>
            <p style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px;">
                <strong>推奨:</strong> VIXとUSD/JPY取得に最も確実なAPIです
            </p>
        `,
        finnhub: `
            <h3>Finnhub APIキー取得方法</h3>
            <ol style="padding-left: 20px;">
                <li><a href="https://finnhub.io/" target="_blank" style="color: var(--primary-color);">Finnhub</a> にアクセス</li>
                <li>「Get free API key」をクリック</li>
                <li>メールアドレスで無料アカウントを作成</li>
                <li>ダッシュボードでAPIキーが表示されます</li>
                <li>無料プランは1分間60リクエストまで</li>
            </ol>
            <p style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px; font-size: 13px;">
                <strong>注意:</strong> 無料プランではVIXにアクセスできない場合があります
            </p>
        `,
        alphavantage: `
            <h3>Alpha Vantage APIキー取得方法</h3>
            <ol style="padding-left: 20px;">
                <li><a href="https://www.alphavantage.co/support/#api-key" target="_blank" style="color: var(--primary-color);">Alpha Vantage</a> にアクセス</li>
                <li>「Get Your Free API Key Today」をクリック</li>
                <li>フォームに必要事項を入力</li>
                <li>メールアドレス宛にAPIキーが届きます</li>
                <li>無料プランは1日25リクエストまで（制限あり）</li>
            </ol>
            <p style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px;">
                <strong>注意:</strong> バックアップ用。Twelve Dataの方が推奨されます
            </p>
        `
    };
    
    const content = guides[provider] || '<p>ガイドが見つかりません</p>';
    document.getElementById('apiKeyGuideContent').innerHTML = content;
    document.getElementById('apiKeyGuideModal').classList.add('active');
}

// APIキー取得ガイドを閉じる
function closeApiKeyGuide() {
    document.getElementById('apiKeyGuideModal').classList.remove('active');
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);

// Service Workerの登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(err => console.log('SW registration failed:', err));
    });
}
