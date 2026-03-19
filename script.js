const state = {
  products: JSON.parse(localStorage.getItem('cafeteria_products') || '[]'),
  sales: JSON.parse(localStorage.getItem('cafeteria_sales') || '[]'),
  deletedSales: JSON.parse(localStorage.getItem('cafeteria_deleted_sales') || '[]'),
  cashClosings: JSON.parse(localStorage.getItem('cafeteria_cash_closings') || '[]'),
  cashSession: JSON.parse(localStorage.getItem('cafeteria_cash_session') || 'null'),
  users: JSON.parse(localStorage.getItem('cafeteria_users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('cafeteria_current_user') || 'null'),
  settings: JSON.parse(localStorage.getItem('cafeteria_settings') || '{"title1":"Mi Cafetería","title2":"Pantalla principal","posTitle":"POS Cafetería","posSubtitle":"Ventas, productos, deudas, cierres y resumen diario.","logoDataUrl":"","accentColor":"#1f7a5c","bgColor":"#f7f7fb","cardColor":"#ffffff","logoSize":120,"title1Size":32,"title2Size":16,"title1Font":"Inter, system-ui, sans-serif","title2Font":"Inter, system-ui, sans-serif","title1Color":"#1d2530","title2Color":"#6f7a86","posLogoSize":56,"ordersEnabled":true}'),
  categories: JSON.parse(localStorage.getItem('cafeteria_categories') || '[]'),
  people: JSON.parse(localStorage.getItem('cafeteria_people') || '[]'),
  stockConfig: JSON.parse(localStorage.getItem('cafeteria_stock_config') || '{"enabled":false,"min":0}'),
  queuedOrders: JSON.parse(localStorage.getItem('cafeteria_queued_orders') || '[]'),
  removedPeopleIds: JSON.parse(localStorage.getItem('cafeteria_removed_people_ids') || '[]'),
  userSalesModes: JSON.parse(localStorage.getItem('cafeteria_user_sales_modes') || '{}'),
  touchUiConfigByUser: JSON.parse(localStorage.getItem('cafeteria_touch_ui_config_by_user') || '{}'),
  categoryImages: JSON.parse(localStorage.getItem('cafeteria_category_images') || '{}'),
  orderCounters: JSON.parse(localStorage.getItem('cafeteria_order_counters') || '{}'),
  deletedRecordIds: JSON.parse(localStorage.getItem('cafeteria_deleted_record_ids') || '{"cashClosings":[],"sales":[]}'),
  subcategories: JSON.parse(localStorage.getItem('cafeteria_subcategories') || '{}'),
  generalCash: JSON.parse(localStorage.getItem('cafeteria_general_cash') || '{"efectivo":0,"qr":0,"estado":"CERRADA","openedAt":"","closedAt":"","openedBy":"","closedBy":"","updatedAt":0}'),
  generalClosings: JSON.parse(localStorage.getItem('cafeteria_general_closings') || '[]')
};

let sessionWatchInterval = null;
const SESSION_INACTIVITY_LIMIT_MS = 3 * 60 * 60 * 1000;
const MAX_IMAGE_UPLOAD_BYTES = Number.POSITIVE_INFINITY;
const imageUploadStatus = { product: {}, category: {} };
const IMAGE_DB_NAME = 'cafeteria_images_db';
const IMAGE_DB_STORE = 'images';
const imagePreviewCache = {};
const imageLoadInFlight = {};
const imageMissingRefs = {};
let imageDbPromise = null;
let scheduledImageUiRefresh = 0;

const $ = (id) => document.getElementById(id);
const loginScreen = $('loginScreen');
const homeScreen = $('homeScreen');
const posScreen = $('posScreen');
const loginUserInput = $('loginUserInput');
const loginPassInput = $('loginPassInput');
const loginBtn = $('loginBtn');
const loginMessage = $('loginMessage');
const homeMessage = $('homeMessage');
const sessionInfo = $('sessionInfo');
const posSessionInfo = $('posSessionInfo');
const logoutBtn = $('logoutBtn');
const posLogoutBtn = $('posLogoutBtn');
const goSalesBtn = $('goSalesBtn');
const startCashBtn = $('startCashBtn');
const closeCashBtn = $('closeCashBtn');
const goCashClosingsBtn = $('goCashClosingsBtn');
const goWarehouseBtn = $('goWarehouseBtn');
const openSettingsBtn = $('openSettingsBtn');
const startCashCard = $('startCashCard');
const confirmStartCash = $('confirmStartCash');
const cashStatus = $('cashStatus');
const cashCloseResult = $('cashCloseResult');
const backHomeBtn = $('backHomeBtn');
const settingsCard = $('settingsCard');
const closeSettingsScreenBtn = $('closeSettingsScreenBtn');
const homeLogo = $('homeLogo');
const logoPlaceholder = $('logoPlaceholder');
const businessName = $('businessName');
const homeSubtitle = $('homeSubtitle');
const posTitle = $('posTitle');
const posSubtitle = $('posSubtitle');
const posHeaderLogo = $('posHeaderLogo');
const title1Input = $('title1Input');
const title2Input = $('title2Input');
const posTitleInput = $('posTitleInput');
const posSubtitleInput = $('posSubtitleInput');
const logoInput = $('logoInput');
const saveSettingsBtn = $('saveSettingsBtn');
const logoSizeInput = $('logoSizeInput');
const posLogoSizeInput = $('posLogoSizeInput');
const title1SizeInput = $('title1SizeInput');
const title2SizeInput = $('title2SizeInput');
const title1FontInput = $('title1FontInput');
const title2FontInput = $('title2FontInput');
const title1ColorInput = $('title1ColorInput');
const title2ColorInput = $('title2ColorInput');
const accentColorInput = $('accentColorInput');
const bgColorInput = $('bgColorInput');
const cardColorInput = $('cardColorInput');
const saleSuccessModal = $('saleSuccessModal');
const saleSuccessContinueBtn = $('saleSuccessContinueBtn');
const saleSuccessTitle = $('saleSuccessTitle');
const stockScreen = $('stockScreen');
const backFromStockPageBtn = $('backFromStockPageBtn');
const stockPageStatus = $('stockPageStatus');
const stockPageTable = $('stockPageTable');
const stockPageProductSelect = $('stockPageProductSelect');
const stockPageAddQtyInput = $('stockPageAddQtyInput');
const stockPageAddBtn = $('stockPageAddBtn');
const stockPageImportBtn = $('stockPageImportBtn');
const stockPageExportBtn = $('stockPageExportBtn');
const stockPageImportFileInput = $('stockPageImportFileInput');
const clearAllStockBtn = $('clearAllStockBtn');
const warehouseScreen = $('warehouseScreen');
const backFromWarehouseBtn = $('backFromWarehouseBtn');
const warehouseStatus = $('warehouseStatus');
const componentNameInput = $('componentNameInput');
const componentMinInput = $('componentMinInput');
const createComponentBtn = $('createComponentBtn');
const warehouseProductSelect = $('warehouseProductSelect');
const warehouseComponentSelect = $('warehouseComponentSelect');
const warehouseLinkQtyInput = $('warehouseLinkQtyInput');
const linkComponentBtn = $('linkComponentBtn');
const warehouseMoveComponentSelect = $('warehouseMoveComponentSelect');
const warehouseMoveQtyInput = $('warehouseMoveQtyInput');
const warehouseMoveDescInput = $('warehouseMoveDescInput');
const warehouseAddPurchaseBtn = $('warehouseAddPurchaseBtn');
const warehouseAddWasteBtn = $('warehouseAddWasteBtn');
const warehouseTable = $('warehouseTable');
const warehouseMovesTable = $('warehouseMovesTable');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const createSaleBtn = $('createSale');
const saleMessage = $('saleMessage');
const openNewSaleBtn = $('openNewSaleBtn');
const saleFormContainer = $('saleFormContainer');
const saleCategoryButtons = $('saleCategoryButtons');
const saleCategorySelectors = $('saleCategorySelectors');
const cartTable = $('cartTable');
const saleGrossTotal = $('saleGrossTotal');
const saleDiscountTotal = $('saleDiscountTotal');
const saleFinalTotal = $('saleFinalTotal');
const paymentType = $('paymentType');
const cashPaymentFields = $('cashPaymentFields');
const mixedFields = $('mixedFields');
const debtFields = $('debtFields');
const partialFields = $('partialFields');
const cashAmount = $('cashAmount');
const cashPaidInput = $('cashPaidInput');
const cashTotalDisplay = $('cashTotalDisplay');
const cashChangeDisplay = $('cashChangeDisplay');
const mixedQrAutoAmount = $('mixedQrAutoAmount');
const debtorSelect = $('debtorSelect');
const partialPersonSelect = $('partialPersonSelect');
const addDebtorBtn = $('addDebtorBtn');
const listDebtorBtn = $('listDebtorBtn');
const addPartialPersonBtn = $('addPartialPersonBtn');
const listPartialPersonBtn = $('listPartialPersonBtn');
const partialPaidAmount = $('partialPaidAmount');
const partialMethod = $('partialMethod');
const orderSearchInput = $('orderSearchInput');
const searchOrdersBtn = $('searchOrdersBtn');
const showFinalizedOrdersBtn = $('showFinalizedOrdersBtn');
const ordersTable = $('ordersTable');
const orderDetailsCard = $('orderDetailsCard');
const orderDetailsTitle = $('orderDetailsTitle');
const pendingOrderItemsTable = $('pendingOrderItemsTable');
const deliveredOrderItemsTable = $('deliveredOrderItemsTable');
const updateOrderBtn = $('updateOrderBtn');
const closeOrderDetailsBtn = $('closeOrderDetailsBtn');
const finalizedOrdersTable = $('finalizedOrdersTable');
const goHistorialBtn = $('goHistorialBtn');
const goEliminadasBtn = $('goEliminadasBtn');
const goSalidasBtn = $('goSalidasBtn');
const addComboItemsBtn = $('addComboItemsBtn');
const comboItemsTable = $('comboItemsTable');
const backFromConfigVentasBtn = $('backFromConfigVentasBtn');
const selectAllPendingBtn = $('selectAllPendingBtn');
const showFinalizedOrdersOnlyBtn = $('showFinalizedOrdersOnlyBtn');
const payTotalDebtBtn = $('payTotalDebtBtn');
const backFromDebtDetailsBtn = $('backFromDebtDetailsBtn');
const closeClosingDetailsBtn = $('closeClosingDetailsBtn');
const closingDetailsCard = $('closingDetailsCard');
const closingDetailsTitle = $('closingDetailsTitle');
const closingSummaryText = $('closingSummaryText');
const closingSalesTable = $('closingSalesTable');
const closingProductsTable = $('closingProductsTable');
const closingUsersTable = $('closingUsersTable');
const openMainConfigBtn = $('openMainConfigBtn');
const openUsersConfigBtn = $('openUsersConfigBtn');
const openDatabaseConfigBtn = $('openDatabaseConfigBtn');
const openSalesConfigBtn = $('openSalesConfigBtn');
const openBillingConfigBtn = $('openBillingConfigBtn');
const salesConfigCard = $('salesConfigCard');
const billingConfigCard = $('billingConfigCard');
const enableStockBtn = $('enableStockBtn');
const disableStockBtn = $('disableStockBtn');
const enableOrdersBtn = $('enableOrdersBtn');
const disableOrdersBtn = $('disableOrdersBtn');
const applySalesConfigBtn = $('applySalesConfigBtn');
const salesConfigStatus = $('salesConfigStatus');
const stockMinInput = $('stockMinInput');
const mainConfigCard = $('mainConfigCard');
const databaseConfigCard = $('databaseConfigCard');
const userManagerCard = $('userManagerCard');
const settingsMenuCard = $('settingsMenuCard');
const backFromMainConfigBtn = $('backFromMainConfigBtn');
const backFromDatabaseConfigBtn = $('backFromDatabaseConfigBtn');
const backFromSalesConfigBtn = $('backFromSalesConfigBtn');
const backFromBillingConfigBtn = $('backFromBillingConfigBtn');
const backFromUsersConfigBtn = $('backFromUsersConfigBtn');
const toggleUserFormBtn = $('toggleUserFormBtn');
const userFormCard = $('userFormCard');
const createUserBtn = $('createUserBtn');
const selectAllUserPermsBtn = $('selectAllUserPermsBtn');
const backFromUserFormBtn = $('backFromUserFormBtn');
const newUserNameInput = $('newUserNameInput');
const newUserPassInput = $('newUserPassInput');
const usersTable = $('usersTable');
const openCreateProductBtn = $('openCreateProductBtn');
const openManageCategoriesBtn = $('openManageCategoriesBtn');
const openCreateComboBtn = $('openCreateComboBtn');
const openProductsListBtn = $('openProductsListBtn');
const openStockBtn = $('openStockBtn');
const importProductsBtn = $('importProductsBtn');
const exportProductsBtn = $('exportProductsBtn');
const importProductsFileInput = $('importProductsFileInput');
const createProductCard = $('createProductCard');
const manageCategoriesCard = $('manageCategoriesCard');
const createComboCard = $('createComboCard');
const backFromCreateProductBtn = $('backFromCreateProductBtn');
const backFromManageCategoriesBtn = $('backFromManageCategoriesBtn');
const backFromCreateComboBtn = $('backFromCreateComboBtn');
const backFromProductsListBtn = $('backFromProductsListBtn');
const backFromStockBtn = $('backFromStockBtn');
const productForm = $('productForm');
const productCategory = $('productCategory');
const productName = $('productName');
const productPrice = $('productPrice');
const productsTable = $('productsTable');
const productListCard = $('productListCard');
const openCreateProductFromListBtn = $('openCreateProductFromListBtn');
const importProductsFromListBtn = $('importProductsFromListBtn');
const exportProductsFromListBtn = $('exportProductsFromListBtn');
const newCategoryInput = $('newCategoryInput');
const addCategoryBtn = $('addCategoryBtn');
const categoriesTable = $('categoriesTable');
const comboNameInput = $('comboNameInput');
const comboPriceInput = $('comboPriceInput');
const comboProductsSelect = $('comboProductsSelect');
const createComboBtn = $('createComboBtn');
const comboCalculatedTotal = $('comboCalculatedTotal');
const stockCard = $('stockCard');
const stockTable = $('stockTable');
const stockProductSelect = $('stockProductSelect');
const stockAddQtyInput = $('stockAddQtyInput');
const addStockBtn = $('addStockBtn');
const importStockBtn = $('importStockBtn');
const exportStockBtn = $('exportStockBtn');
const importStockFileInput = $('importStockFileInput');
const addOutflowBtn = $('addOutflowBtn');
const outflowsTable = $('outflowsTable');
const outflowDirection = $('outflowDirection');
const outflowMethod = $('outflowMethod');
const outflowDescription = $('outflowDescription');
const outflowAmount = $('outflowAmount');
const summarySalesCount = $('summarySalesCount');
const summaryTotal = $('summaryTotal');
const summaryCashDetail = $('summaryCashDetail');
const summaryQrDetail = $('summaryQrDetail');
const summaryBox = $('summaryBox');
const summaryDebt = $('summaryDebt');
const summaryCash = $('summaryCash');
const summaryBoxInCash = $('summaryBoxInCash');
const summaryOutCash = $('summaryOutCash');
const summaryInCash = $('summaryInCash');
const summaryNetCash = $('summaryNetCash');
const summaryFinalCash = $('summaryFinalCash');
const summaryQr = $('summaryQr');
const summaryOutQr = $('summaryOutQr');
const summaryInQr = $('summaryInQr');
const summaryFinalQr = $('summaryFinalQr');
const soldProductsTable = $('soldProductsTable');
const cashTotalBox = $('cashTotalBox');
const qrTotalBox = $('qrTotalBox');
const closingsMonthFilter = $('closingsMonthFilter');
const cashClosingsTable = $('cashClosingsTable');
const salesFromDate = $('salesFromDate');
const salesToDate = $('salesToDate');
const salesTable = $('salesTable');
const searchSalesBtn = $('searchSalesBtn');
const salesUserFilter = $('salesUserFilter');
const clearSalesFilterBtn = $('clearSalesFilterBtn');
const salesTodayBtn = $('salesTodayBtn');
const salesAllBtn = $('salesAllBtn');
const salesOrderSearchInput = $('salesOrderSearchInput');
const openProductSalesReportBtn = $('openProductSalesReportBtn');
const productSalesReportCard = $('productSalesReportCard');
const closeProductSalesReportBtn = $('closeProductSalesReportBtn');
const productSalesReportRange = $('productSalesReportRange');
const productSalesReportTable = $('productSalesReportTable');
const deletedSalesTable = $('deletedSalesTable');
const searchDeletedSalesBtn = $('searchDeletedSalesBtn');
const clearDeletedSalesFilterBtn = $('clearDeletedSalesFilterBtn');
const clearDeletedSalesBtn = $('clearDeletedSalesBtn');
const deletedSalesFromDate = $('deletedSalesFromDate');
const deletedSalesToDate = $('deletedSalesToDate');
const toggleDebtPaymentsBtn = $('toggleDebtPaymentsBtn');
const debtPaymentsHistoryCard = $('debtPaymentsHistoryCard');
const debtPaymentsTable = $('debtPaymentsTable');
const debtPaymentsFromDate = $('debtPaymentsFromDate');
const debtPaymentsToDate = $('debtPaymentsToDate');
const searchDebtPaymentsBtn = $('searchDebtPaymentsBtn');
const clearDebtPaymentsFilterBtn = $('clearDebtPaymentsFilterBtn');
const firebaseDbUrlInput = $('firebaseDbUrlInput');
const firebaseDbTokenInput = $('firebaseDbTokenInput');
const firebaseDbPathInput = $('firebaseDbPathInput');
const syncNowBtn = $('syncNowBtn');
const syncStatus = $('syncStatus');
const billingEnabledInput = $('billingEnabledInput');
const billingLogoInput = $('billingLogoInput');
const removeBillingLogoBtn = $('removeBillingLogoBtn');
const billingTitleInput = $('billingTitleInput');
const billingCurrencyInput = $('billingCurrencyInput');
const billingPaperWidthInput = $('billingPaperWidthInput');
const billingMarginInput = $('billingMarginInput');
const billingMessage1Input = $('billingMessage1Input');
const billingMessage2Input = $('billingMessage2Input');
const saveBillingConfigBtn = $('saveBillingConfigBtn');
const billingConfigStatus = $('billingConfigStatus');
const billingModeIndicator = $('billingModeIndicator');
const billingLogoCurrentPreview = $('billingLogoCurrentPreview');
const billingLogoCurrentText = $('billingLogoCurrentText');
const billingToggleActionBtn = $('billingToggleActionBtn');
const billingLogoSizeInput = $('billingLogoSizeInput');
const billingTitleSizeInput = $('billingTitleSizeInput');
const billingTitleBoldInput = $('billingTitleBoldInput');
const billingTitleFontInput = $('billingTitleFontInput');
const billingLogoTitleGapInput = $('billingLogoTitleGapInput');
const billingMessage1SizeInput = $('billingMessage1SizeInput');
const billingMessage1BoldInput = $('billingMessage1BoldInput');
const billingMessage1FontInput = $('billingMessage1FontInput');
const billingMessage2SizeInput = $('billingMessage2SizeInput');
const billingMessage2BoldInput = $('billingMessage2BoldInput');
const billingMessage2FontInput = $('billingMessage2FontInput');
const billingAutoPrintInput = $('billingAutoPrintInput');
const billingAutoPrintIndicator = $('billingAutoPrintIndicator');
const billingAutoPrintToggleActionBtn = $('billingAutoPrintToggleActionBtn');
const closeCashBtnCard = $('closeCashBtn');
let activeSaleCategory = '';
let activeOrderId = '';
let isSubmittingSale = false;
let saleProceedReady = false;
state.currentCart = [];
state.outflows = JSON.parse(localStorage.getItem('cafeteria_outflows') || '[]');
state.comboDraft = [];
state.activeDebtorId = '';
state.debtPayments = JSON.parse(localStorage.getItem('cafeteria_debt_payments') || '[]');
state.comboBuilderItems = [];
state.lastSyncAt = Number(localStorage.getItem('cafeteria_last_sync_at') || '0');
state.forceLogoutAt = Number(localStorage.getItem('cafeteria_force_logout_at') || '0');
state.cashBoxes = JSON.parse(localStorage.getItem('cafeteria_cash_boxes') || '[]');
state.selectedClosingIds = [];
state.generatedClosingsStats = null;
state.components = JSON.parse(localStorage.getItem('cafeteria_components') || '[]');
state.componentLinks = JSON.parse(localStorage.getItem('cafeteria_component_links') || '{}');
state.componentMoves = JSON.parse(localStorage.getItem('cafeteria_component_moves') || '[]');

let appConfig = {
  stockActivo: Boolean(state.stockConfig?.enabled),
  activarPedidos: state.settings?.ordersEnabled !== false,
  stockMinimo: Number(state.stockConfig?.min || 0)
};

let cloudPullInFlight = null;
let cloudSyncTimer = null;
let lastCloudPullAt = 0;
let cloudHydrated = false;
let bootCloudReady = false;
let bootListenerReady = false;
let bootCashReady = false;
let firebaseRealtimeListener = null;
let firebaseRealtimeListenerUrl = '';
let realtimeReconnectTimer = null;
const CLOUD_PULL_MIN_INTERVAL_MS = 2500;
const CLOUD_POLL_INTERVAL_MS = 8000;

function syncAppConfig() {
  appConfig = {
    stockActivo: Boolean(state.stockConfig?.enabled),
    activarPedidos: state.settings?.ordersEnabled !== false,
    stockMinimo: Math.max(0, Number(state.stockConfig?.min || 0))
  };
}

let tempConfig = { stockActivo: appConfig.stockActivo, activarPedidos: appConfig.activarPedidos };

function syncTempConfigFromApp() {
  tempConfig = { stockActivo: appConfig.stockActivo, activarPedidos: appConfig.activarPedidos };
}
state.activeCashBoxId = localStorage.getItem('cafeteria_active_cash_box_id') || '';
state.systemStatus = localStorage.getItem('cafeteria_system_status') || 'CAJA_CERRADA';
state.salesHistoryMode = 'all';

const SHARED_DB_PATH = 'cafeteria_shared';
const LEGACY_DB_PATH = 'cafeteria_BaseDatos2';
const defaultCloudConfig = {
  firebaseDbUrl: 'https://cafeteria-sh82-3dea3-default-rtdb.firebaseio.com',
  firebaseDbToken: '',
  firebaseDbPath: SHARED_DB_PATH,
  firebaseStorageBucket: 'cafeteria-sh82-3dea3.firebasestorage.app'
};

const defaultBillingConfig = {
  enabled: false,
  logoDataUrl: '',
  title: 'CAFETERIA SH82',
  currencySymbol: 'Bs',
  paperWidthMm: 80,
  marginMm: 4,
  message1: 'Gracias por su compra',
  message2: 'SHALOM',
  logoSizeMm: 28,
  titleSizePt: 12,
  titleBold: true,
  titleFont: 'helvetica',
  logoTitleGapMm: 8,
  message1SizePt: 9,
  message1Bold: false,
  message1Font: 'helvetica',
  message2SizePt: 9,
  message2Bold: false,
  message2Font: 'helvetica',
  autoPrintEnabled: false
};

function normalizeBillingSettings() {
  if (!state.settings || typeof state.settings !== 'object') state.settings = {};
  const merged = { ...defaultBillingConfig, ...(state.settings.billing || {}) };
  merged.enabled = (typeof merged.enabled === 'string')
    ? ['1', 'true', 'si', 'sí', 'on'].includes(String(merged.enabled).trim().toLowerCase())
    : Boolean(merged.enabled);
  merged.paperWidthMm = Math.max(58, Math.min(120, Number(merged.paperWidthMm || 80)));
  merged.marginMm = Math.max(0, Math.min(20, Number(merged.marginMm || 4)));
  merged.title = String(merged.title || defaultBillingConfig.title);
  merged.currencySymbol = String(merged.currencySymbol || defaultBillingConfig.currencySymbol);
  merged.message1 = String(merged.message1 || '');
  merged.message2 = String(merged.message2 || '');
  merged.logoSizeMm = Math.max(12, Math.min(60, Number(merged.logoSizeMm || 28)));
  merged.titleSizePt = Math.max(9, Math.min(24, Number(merged.titleSizePt || 12)));
  merged.titleBold = merged.titleBold !== false;
  merged.titleFont = ['helvetica', 'times', 'courier'].includes(String(merged.titleFont || 'helvetica')) ? String(merged.titleFont || 'helvetica') : 'helvetica';
  merged.logoTitleGapMm = Math.max(2, Math.min(24, Number(merged.logoTitleGapMm || 8)));
  merged.message1SizePt = Math.max(7, Math.min(18, Number(merged.message1SizePt || 9)));
  merged.message1Bold = Boolean(merged.message1Bold);
  merged.message1Font = ['helvetica', 'times', 'courier'].includes(String(merged.message1Font || 'helvetica')) ? String(merged.message1Font || 'helvetica') : 'helvetica';
  merged.message2SizePt = Math.max(7, Math.min(18, Number(merged.message2SizePt || 9)));
  merged.message2Bold = Boolean(merged.message2Bold);
  merged.message2Font = ['helvetica', 'times', 'courier'].includes(String(merged.message2Font || 'helvetica')) ? String(merged.message2Font || 'helvetica') : 'helvetica';
  merged.autoPrintEnabled = (typeof merged.autoPrintEnabled === 'string')
    ? ['1', 'true', 'si', 'sí', 'on'].includes(String(merged.autoPrintEnabled).trim().toLowerCase())
    : Boolean(merged.autoPrintEnabled);
  state.settings.billing = merged;
  return merged;
}

function normalizeCloudSettings() {
  state.settings = { ...defaultCloudConfig, ...(state.settings || {}) };
  const configuredDbUrl = String(state.settings.firebaseDbUrl || '').trim();
  if (configuredDbUrl && configuredDbUrl !== defaultCloudConfig.firebaseDbUrl) {
    console.warn('[cloud][config] firebaseDbUrl personalizado detectado; se forzará URL compartida.', { configuredDbUrl, forcedDbUrl: defaultCloudConfig.firebaseDbUrl });
  }
  state.settings.firebaseDbUrl = defaultCloudConfig.firebaseDbUrl;
  if (!String(state.settings.firebaseDbToken || '').trim()) state.settings.firebaseDbToken = defaultCloudConfig.firebaseDbToken;
  if (!String(state.settings.firebaseStorageBucket || '').trim()) state.settings.firebaseStorageBucket = defaultCloudConfig.firebaseStorageBucket;
  const currentPath = String(state.settings.firebaseDbPath || '').trim();
  if (currentPath && currentPath !== SHARED_DB_PATH) {
    console.warn('[cloud][config] firebaseDbPath personalizado detectado; se forzará raíz compartida.', { currentPath, forcedPath: SHARED_DB_PATH });
  }
  state.settings.firebaseDbPath = SHARED_DB_PATH;
  normalizeBillingSettings();
}

normalizeCloudSettings();

function cloudSeedTemplate() {
  return {
    products: [],
    sales: [],
    deletedSales: [],
    cashClosings: [],
    cashSession: null,
    users: [],
    settings: {},
    categories: [],
    subcategories: {},
    people: [],
    stockConfig: { enabled: false, min: 0 },
    outflows: [],
    debtPayments: [],
    components: [],
    componentLinks: {},
    componentMoves: [],
    cashBoxes: [],
    activeCashBoxId: '',
    systemStatus: 'CAJA_CERRADA',
    forceLogoutAt: 0,
    userSalesModes: {},
    touchUiConfigByUser: {},
    categoryImages: {},
    orderCounters: {},
    deletedRecordIds: { cashClosings: [], sales: [] },
    generalCash: { efectivo: 0, qr: 0, estado: 'CERRADA', openedAt: '', closedAt: '', openedBy: '', closedBy: '', updatedAt: 0 },
    generalClosings: [],
    updatedAt: 0
  };
}

function normalizeCollectionToArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value).filter((x) => x && typeof x === 'object');
  return [];
}

function normalizeCloudSeedObject(raw) {
  const base = cloudSeedTemplate();
  const data = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? { ...raw } : {};
  const merged = { ...base, ...data };
  merged.products = normalizeCollectionToArray(merged.products);
  merged.sales = normalizeCollectionToArray(merged.sales);
  merged.deletedSales = normalizeCollectionToArray(merged.deletedSales);
  merged.cashClosings = normalizeCollectionToArray(merged.cashClosings);
  merged.users = normalizeCollectionToArray(merged.users);
  if (!Array.isArray(merged.categories)) merged.categories = [];
  if (!merged.subcategories || typeof merged.subcategories !== 'object' || Array.isArray(merged.subcategories)) merged.subcategories = {};
  if (!Array.isArray(merged.people)) merged.people = [];
  if (!merged.stockConfig || typeof merged.stockConfig !== 'object') merged.stockConfig = { enabled: false, min: 0 };
  if (!Array.isArray(merged.outflows)) merged.outflows = [];
  if (!Array.isArray(merged.debtPayments)) merged.debtPayments = [];
  if (!Array.isArray(merged.components)) merged.components = [];
  if (!merged.componentLinks || typeof merged.componentLinks !== 'object' || Array.isArray(merged.componentLinks)) merged.componentLinks = {};
  if (!Array.isArray(merged.componentMoves)) merged.componentMoves = [];
  if (!Array.isArray(merged.cashBoxes)) merged.cashBoxes = [];
  if (!merged.orderCounters || typeof merged.orderCounters !== 'object' || Array.isArray(merged.orderCounters)) merged.orderCounters = {};
  if (!merged.deletedRecordIds || typeof merged.deletedRecordIds !== 'object' || Array.isArray(merged.deletedRecordIds)) merged.deletedRecordIds = { cashClosings: [], sales: [] };
  merged.deletedRecordIds.cashClosings = Array.isArray(merged.deletedRecordIds.cashClosings) ? merged.deletedRecordIds.cashClosings : [];
  merged.deletedRecordIds.sales = Array.isArray(merged.deletedRecordIds.sales) ? merged.deletedRecordIds.sales : [];
  if (!merged.generalCash || typeof merged.generalCash !== 'object' || Array.isArray(merged.generalCash)) merged.generalCash = base.generalCash;
  merged.generalCash = { ...base.generalCash, ...merged.generalCash };
  if (!Array.isArray(merged.generalClosings)) merged.generalClosings = [];
  if (!merged.settings || typeof merged.settings !== 'object' || Array.isArray(merged.settings)) merged.settings = {};
  if (!merged.userSalesModes || typeof merged.userSalesModes !== 'object' || Array.isArray(merged.userSalesModes)) merged.userSalesModes = {};
  if (!merged.touchUiConfigByUser || typeof merged.touchUiConfigByUser !== 'object' || Array.isArray(merged.touchUiConfigByUser)) merged.touchUiConfigByUser = {};
  if (!merged.categoryImages || typeof merged.categoryImages !== 'object' || Array.isArray(merged.categoryImages)) merged.categoryImages = {};
  merged.updatedAt = Math.max(Number(merged.updatedAt || 0), Date.now());
  if (!merged.users.find((u) => u?.username === 'admin')) {
    merged.users.push({ username: 'admin', password: '5432', permissions: defaultPermissions(), createdBy: 'admin', enabled: true, lastActivityAt: Date.now(), lastLogoutAt: 0 });
  }
  return merged;
}

let cloudSeedValidatedAt = 0;
async function ensureCloudSeedData(options = {}) {
  if (!state.settings?.firebaseDbUrl) return;
  if (!options.force && (Date.now() - cloudSeedValidatedAt) < 5000) return;
  const token = normalizedFirebaseToken();
  const authModes = token ? [true, false] : [false];
  let lastError = null;
  for (const includeToken of authModes) {
    const modeLabel = includeToken ? 'token' : 'sin-token';
    const rootUrl = buildCloudRootUrl({ includeToken });
    if (!rootUrl) continue;
    try {
      const resp = await fetch(rootUrl);
      if (!resp.ok) {
        if (includeToken && (resp.status === 401 || resp.status === 403)) continue;
        throw new Error(`[seed] GET root fallo ${resp.status}`);
      }
      let raw = null;
      try { raw = await resp.json(); } catch { raw = null; }
      const validObject = raw && typeof raw === 'object' && !Array.isArray(raw);
      if (validObject) {
        cloudSeedValidatedAt = Date.now();
        return;
      }
      console.warn('[seed] Raíz inválida detectada. Re-sembrando cafeteria_shared.', { modeLabel, currentType: typeof raw, currentValue: raw });
      const seeded = normalizeCloudSeedObject(raw);
      const putResp = await fetch(rootUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seeded) });
      if (!putResp.ok) {
        if (includeToken && (putResp.status === 401 || putResp.status === 403)) continue;
        throw new Error(`[seed] PUT seed fallo ${putResp.status}`);
      }
      cloudSeedValidatedAt = Date.now();
      console.info('[seed] cafeteria_shared sembrado correctamente.', { modeLabel });
      return;
    } catch (err) {
      lastError = err;
      if (!(includeToken && [401, 403].includes(Number(err?.status || 0)))) {
        console.error('[seed] Error en ensureCloudSeedData', { modeLabel, message: err?.message });
      }
    }
  }
  if (lastError) throw lastError;
}

function saleDebugContext(extra = {}) {
  const activeCash = getActiveCashBox();
  return {
    firebaseDbUrl: state.settings?.firebaseDbUrl || '',
    firebaseDbPath: state.settings?.firebaseDbPath || '',
    rootUrlWithToken: buildCloudRootUrl({ includeToken: true }),
    rootUrlWithoutToken: buildCloudRootUrl({ includeToken: false }),
    activeCashBoxId: state.activeCashBoxId || '',
    activeCashExists: Boolean(activeCash),
    cashStatus: state.systemStatus,
    currentUser: state.currentUser?.username || '',
    cloudHydrated,
    hasOrderCounterMap: Boolean(state.orderCounters && typeof state.orderCounters === 'object'),
    hasProductsLocal: Array.isArray(state.products),
    localProductsCount: Array.isArray(state.products) ? state.products.length : -1,
    localSalesCount: Array.isArray(state.sales) ? state.sales.length : -1,
    ...extra
  };
}


function money(v) { return `Bs ${Number(v || 0).toFixed(2)}`; }
function orderNumberLabel(v) { return (v === undefined || v === null || v === '') ? '-' : String(v); }
function formatProductWithComboText(item) {
  const p = state.products.find((x) => x.id === item?.id);
  if (!p || !Array.isArray(p.combo) || !p.combo.length) return item?.name || '';
  const grouped = new Map();
  p.combo.forEach((id) => {
    const cp = state.products.find((x) => x.id === id);
    const nm = cp?.name || 'Producto';
    grouped.set(nm, (grouped.get(nm) || 0) + 1);
  });
  const lines = [...grouped.entries()].map(([n,q]) => `${q} ${n}`);
  return `${item?.name || ''}\n${lines.join('\n')}`;
}

function formatProductWithComboDetails(item) {
  const p = state.products.find((x) => x.id === item?.id);
  if (!p || !Array.isArray(p.combo) || !p.combo.length) return item?.name || '';
  const grouped = new Map();
  p.combo.forEach((id) => {
    const cp = state.products.find((x) => x.id === id);
    const nm = cp?.name || 'Producto';
    grouped.set(nm, (grouped.get(nm) || 0) + 1);
  });
  const lines = [...grouped.entries()].map(([n,q]) => `<li>${q} ${n}</li>`).join('');
  return `${item?.name || ''}<ul class="combo-lines">${lines}</ul>`;
}
function uid() { return `${Date.now()}_${Math.floor(Math.random() * 9999)}`; }
function setMsg(el, txt, ok = true) { if (!el) return; el.textContent = txt; el.className = ok ? 'ok' : 'error'; }

function safeLocalSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn('[localStorage] setItem failed', key, err?.message || err);
    return false;
  }
}

function refreshFinancialViews() {
  renderSalesHistory();
  renderDeletedSales();
  renderDebtors();
  renderDebtPayments();
  renderSummary();
  renderSoldProductsList();
  renderCashStatus();
  renderCashClosings();
  renderOutflows();
}

function productsForLocalPersistence() {
  return (state.products || []).map((p) => ({ ...p }));
}

function categoryImagesForLocalPersistence() {
  return { ...(state.categoryImages || {}) };
}

function saveLocalState() {
  safeLocalSet('cafeteria_last_sync_at', String(state.lastSyncAt || 0));
  safeLocalSet('cafeteria_force_logout_at', String(state.forceLogoutAt || 0));
  safeLocalSet('cafeteria_cash_boxes', JSON.stringify(state.cashBoxes || []));
  safeLocalSet('cafeteria_active_cash_box_id', state.activeCashBoxId || '');
  safeLocalSet('cafeteria_system_status', state.systemStatus || 'CAJA_CERRADA');
  safeLocalSet('cafeteria_products', JSON.stringify(productsForLocalPersistence()));
  safeLocalSet('cafeteria_sales', JSON.stringify(state.sales));
  safeLocalSet('cafeteria_deleted_sales', JSON.stringify(state.deletedSales));
  safeLocalSet('cafeteria_cash_closings', JSON.stringify(state.cashClosings));
  safeLocalSet('cafeteria_cash_session', JSON.stringify(state.cashSession));
  safeLocalSet('cafeteria_users', JSON.stringify(state.users));
  safeLocalSet('cafeteria_current_user', JSON.stringify(state.currentUser));
  safeLocalSet('cafeteria_settings', JSON.stringify(state.settings));
  safeLocalSet('cafeteria_categories', JSON.stringify(state.categories));
  safeLocalSet('cafeteria_people', JSON.stringify(state.people));
  safeLocalSet('cafeteria_stock_config', JSON.stringify(state.stockConfig));
  safeLocalSet('cafeteria_outflows', JSON.stringify(state.outflows));
  safeLocalSet('cafeteria_debt_payments', JSON.stringify(state.debtPayments));
  safeLocalSet('cafeteria_components', JSON.stringify(state.components || []));
  safeLocalSet('cafeteria_component_links', JSON.stringify(state.componentLinks || {}));
  safeLocalSet('cafeteria_component_moves', JSON.stringify(state.componentMoves || []));
  safeLocalSet('cafeteria_queued_orders', JSON.stringify(state.queuedOrders || []));
  safeLocalSet('cafeteria_removed_people_ids', JSON.stringify(state.removedPeopleIds || []));
  safeLocalSet('cafeteria_user_sales_modes', JSON.stringify(state.userSalesModes || {}));
  safeLocalSet('cafeteria_touch_ui_config_by_user', JSON.stringify(state.touchUiConfigByUser || {}));
  safeLocalSet('cafeteria_category_images', JSON.stringify(categoryImagesForLocalPersistence()));
  safeLocalSet('cafeteria_order_counters', JSON.stringify(state.orderCounters || {}));
  safeLocalSet('cafeteria_deleted_record_ids', JSON.stringify(state.deletedRecordIds || { cashClosings: [], sales: [] }));
  safeLocalSet('cafeteria_subcategories', JSON.stringify(state.subcategories || {}));
  safeLocalSet('cafeteria_general_cash', JSON.stringify(state.generalCash || { efectivo: 0, qr: 0, estado: 'CERRADA', openedAt: '', closedAt: '', openedBy: '', closedBy: '', updatedAt: 0 }));
  safeLocalSet('cafeteria_general_closings', JSON.stringify(state.generalClosings || []));
}

function scheduleCloudSync(delayMs = 1200) {
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    cloudSyncTimer = null;
    syncToCloud().catch((err) => console.error('[sync] scheduled sync failed', err));
  }, Math.max(200, Number(delayMs || 1200)));
}


function normalizedFirebaseToken() {
  const raw = String(state.settings?.firebaseDbToken || '').trim();
  if (!raw || raw === 'undefined' || raw === 'null') return '';
  return raw;
}

function buildCloudRootUrl({ includeToken = true } = {}) {
  const base = String(state.settings?.firebaseDbUrl || '').replace(/\/$/, '');
  if (!base) return '';
  const token = includeToken ? normalizedFirebaseToken() : '';
  const qs = token ? `?auth=${encodeURIComponent(token)}` : '';
  return `${base}/${state.settings.firebaseDbPath || SHARED_DB_PATH}.json${qs}`;
}

function cloudRootUrl() {
  return buildCloudRootUrl({ includeToken: true });
}

function cloudChildUrl(childPath = '') {
  const root = cloudRootUrl();
  if (!root) return '';
  const safeChild = String(childPath || '').replace(/^\/+/, '');
  return safeChild ? root.replace(/\.json(\?.*)?$/, `/${safeChild}.json$1`) : root;
}


function inferStorageProjectId() {
  const dbUrl = String(state.settings?.firebaseDbUrl || defaultCloudConfig.firebaseDbUrl || '');
  const m = dbUrl.match(/^https:\/\/([^.]+)\./i);
  const hostId = m ? String(m[1] || '').trim() : '';
  if (!hostId) return '';
  return hostId.replace(/-default-rtdb$/i, '');
}

function inferStorageBucketCandidates() {
  const configured = String(state.settings?.firebaseStorageBucket || '').trim();
  if (configured) return [configured];
  const projectId = inferStorageProjectId();
  if (!projectId) return [];
  return [`${projectId}.firebasestorage.app`, `${projectId}.appspot.com`];
}

function inferStorageBucket() {
  return inferStorageBucketCandidates()[0] || '';
}

let resolvedStorageBucket = '';
async function resolveStorageBucket() {
  if (resolvedStorageBucket) return resolvedStorageBucket;
  const candidates = inferStorageBucketCandidates();
  if (!candidates.length) return '';
  for (const bucket of candidates) {
    try {
      const res = await fetch(`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?maxResults=1`, { method: 'GET' });
      if (res.status !== 404) {
        resolvedStorageBucket = bucket;
        return bucket;
      }
    } catch {}
  }
  return candidates[0] || '';
}

let firebaseStorageReadyPromise = null;
let firebaseStorageBucketBound = '';
async function ensureFirebaseStorageSdk(bucketOverride = '') {
  if (window.firebase?.storage) return window.firebase;
  if (firebaseStorageReadyPromise && (!bucketOverride || bucketOverride === firebaseStorageBucketBound)) return firebaseStorageReadyPromise;
  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.firebase?.storage) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
  firebaseStorageReadyPromise = (async () => {
    await withTimeout(loadScript('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js'), 7000, 'No se pudo cargar Firebase App SDK.');
    await withTimeout(loadScript('https://www.gstatic.com/firebasejs/10.12.4/firebase-storage-compat.js'), 7000, 'No se pudo cargar Firebase Storage SDK.');
    if (!window.firebase) throw new Error('Firebase SDK no disponible.');
    const bucket = bucketOverride || inferStorageBucket();
    if (!bucket) throw new Error('No se pudo inferir firebaseStorageBucket.');
    firebaseStorageBucketBound = bucket;
    const appName = 'cafeteria-storage';
    const existing = window.firebase.apps.find((a) => a.name === appName);
    const app = existing || window.firebase.initializeApp({ storageBucket: bucket }, appName);
    return { app, storage: window.firebase.storage(app) };
  })();
  return firebaseStorageReadyPromise;
}

function normalizeImagePathSegment(value) {
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'item';
}


function withTimeout(promise, timeoutMs, message = 'Tiempo de espera agotado.') {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), Math.max(1000, Number(timeoutMs || 25000)));
  });
  return Promise.race([promise, timeout]).finally(() => { if (timer) clearTimeout(timer); });
}

async function optimizeImageForUpload(file, { maxSize = 300 } = {}) {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(imageBitmap.width || 1, imageBitmap.height || 1));
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();
  const toBlob = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await toBlob('image/webp', 0.78);
  if (!blob) blob = await toBlob('image/jpeg', 0.8);
  if (!blob) throw new Error('No se pudo procesar la imagen.');
  return { blob, contentType: blob.type || 'image/webp' };
}

async function uploadImageToFirebaseStorage({ kind, key, file, previousUrl = '', onProgress = null }) {
  try {
    const bucket = await resolveStorageBucket();
    if (!bucket) throw new Error('No se pudo determinar el bucket de Firebase Storage.');
    const safeKey = normalizeImagePathSegment(key);
    const ext = file.type.includes('png') ? 'webp' : (file.type.includes('jpeg') || file.type.includes('jpg') ? 'jpg' : 'webp');
    const folder = kind === 'category' ? 'categorias' : 'productos';
    const path = `${folder}/${safeKey}-${Date.now()}.${ext}`;
    const optimized = await optimizeImageForUpload(file, { maxSize: kind === 'category' ? 400 : 300 });
    const { storage } = await ensureFirebaseStorageSdk(bucket);
    const ref = storage.ref(path);
    const task = ref.put(optimized.blob, { contentType: optimized.contentType, cacheControl: 'public,max-age=31536000' });
    await withTimeout(new Promise((resolve, reject) => {
      task.on('state_changed', (snap) => {
        if (!onProgress) return;
        const total = Number(snap.totalBytes || 0);
        const loaded = Number(snap.bytesTransferred || 0);
        onProgress(total > 0 ? Math.round((loaded / total) * 100) : 0);
      }, (err) => reject(err), () => resolve());
    }), 20000, 'La subida tardó demasiado. Verifica tu conexión o reglas de Firebase Storage.');
    const downloadUrl = await withTimeout(ref.getDownloadURL(), 8000, 'No se pudo obtener URL pública de la imagen.');
    try {
      if (previousUrl && previousUrl.includes('/o/')) {
        const oldPath = decodeURIComponent(previousUrl.split('/o/')[1]?.split('?')[0] || '');
        if (oldPath) {
          await storage.ref(oldPath).delete();
        }
      }
    } catch {}
    return downloadUrl;
  } catch (err) {
    console.error('[storage] Error durante subida/URL en Firebase Storage', { kind, key, message: err?.message });
    throw err;
  }
}


function cloudBaseEndpoint({ includeToken = true } = {}) {
  const root = buildCloudRootUrl({ includeToken });
  return root ? root.replace(/\.json(\?.*)?$/, '') : '';
}

function cloudPathUrl(path, { includeToken = true } = {}) {
  const base = cloudBaseEndpoint({ includeToken });
  if (!base) return '';
  const token = includeToken ? normalizedFirebaseToken() : '';
  const qs = token ? `?auth=${encodeURIComponent(token)}` : '';
  return `${base}/${String(path || '').replace(/^\/+/, '')}.json${qs}`;
}

async function commitSaleToFirebaseTransaction(sale) {
  await ensureCloudSeedData();
  console.info('[sale][commit] Iniciando confirmación RTDB', saleDebugContext({ saleId: sale?.id, salePreview: sale }));
  const token = normalizedFirebaseToken();
  const authModes = token ? [true, false] : [false];
  let lastError = null;
  for (const includeToken of authModes) {
    const modeLabel = includeToken ? 'token' : 'sin-token';
    try {
      const rootUrl = buildCloudRootUrl({ includeToken });
      const rootResp = await fetch(rootUrl);
      if (!rootResp.ok) {
        if (includeToken && (rootResp.status === 401 || rootResp.status === 403)) {
          console.warn('[sale][commit][token] GET root rechazado con token. Reintentando sin token.', { status: rootResp.status });
          continue;
        }
        throw Object.assign(new Error(`[sale][commit][rtdb] GET root fallo (${rootResp.status})`), { code: 'RTDB_HTTP_ROOT_GET', status: rootResp.status, stage: 'root_get', url: rootUrl });
      }
      let remoteRaw = null;
      try { remoteRaw = await rootResp.json(); } catch { remoteRaw = null; }
      const remote = normalizeCloudSeedObject(remoteRaw);
      const payload = {
        ...remote,
        sales: mergeByIdPreferRemote(remote.sales, state.sales || []),
        products: mergeByIdPreferRemote(remote.products, state.products || []),
        updatedAt: Date.now()
      };
      const putResp = await fetch(rootUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!putResp.ok) throw Object.assign(new Error(`[sale][commit][rtdb] PUT root fallo (${putResp.status})`), { code: 'RTDB_HTTP_ROOT_PUT', status: putResp.status, stage: 'root_put', url: rootUrl });
      console.info('[sale][firebase-write]', { saleId: sale.id, rootUrl, salesCount: payload.sales.length });

      state.lastSyncAt = Number(payload.updatedAt || Date.now());
      saveLocalState();
      console.info('[sale][state-after-write]', { saleId: sale.id, localSalesCount: state.sales?.length || 0, activeCashBoxId: state.activeCashBoxId || '' });
      console.info('[sale][commit] Venta confirmada en RTDB', { saleId: sale.id, modeLabel, rootUrl, salesCount: payload.sales.length });
      return;
    } catch (err) {
      lastError = err;
      if (includeToken && [401, 403].includes(Number(err?.status || 0))) continue;
      console.error('[sale][commit] Error confirmando venta en RTDB', { modeLabel, code: err?.code, status: err?.status, stage: err?.stage, message: err?.message, url: err?.url, saleId: sale?.id, context: saleDebugContext() });
      if (!(includeToken && [401, 403].includes(Number(err?.status || 0)))) break;
    }
  }
  throw lastError || new Error('sale transaction failed');
}

function applyCloudData(data) {
  const normalized = normalizeCloudSeedObject(data);
  console.info('[users][apply]', { usersCount: Array.isArray(normalized.users) ? normalized.users.length : -1 });
  console.info('[settings][apply]', { title1: normalized.settings?.title1 || '', hasLogo: Boolean(normalized.settings?.logoDataUrl) });
  console.info('[billing][apply]', { hasBillingLogo: Boolean(normalized.settings?.billing?.logoDataUrl), billingEnabled: Boolean(normalized.settings?.billing?.enabled) });
  console.info('[sale][apply]', { salesCount: Array.isArray(normalized.sales) ? normalized.sales.length : -1, activeCashBoxId: normalized.activeCashBoxId || '' });
  console.info('[debt][apply]', { debtPaymentsCount: Array.isArray(normalized.debtPayments) ? normalized.debtPayments.length : -1 });
  state.lastSyncAt = Number(normalized.updatedAt || Date.now());
  state.forceLogoutAt = Number(normalized.forceLogoutAt || 0);
  ['products','sales','deletedSales','cashClosings','cashSession','users','settings','categories','subcategories','people','stockConfig','outflows','debtPayments','components','componentLinks','componentMoves','cashBoxes','activeCashBoxId','systemStatus','userSalesModes','touchUiConfigByUser','categoryImages','orderCounters','deletedRecordIds','generalCash','generalClosings'].forEach((k) => {
    if (normalized[k] !== undefined) state[k] = normalized[k];
  });
  if (state.currentUser && !validateSessionPolicy({ silent: true })) return;
  normalizeCloudSettings();
  normalizeWarehouseData();
  normalizeDebtPaymentsData();
  normalizePeopleData();
  normalizeCashState();
  const removedClosings = new Set((state.deletedRecordIds?.cashClosings || []).map((x) => String(x)));
  const removedSales = new Set((state.deletedRecordIds?.sales || []).map((x) => String(x)));
  if (removedClosings.size) state.cashClosings = (state.cashClosings || []).filter((x) => !removedClosings.has(String(x?.id || '')));
  if (removedSales.size) state.sales = (state.sales || []).filter((x) => !removedSales.has(String(x?.id || '')));
  syncAppConfig();
  saveLocalState();
  renderOrdersVisibility();
  renderProducts(); renderOrders(false); renderSalesHistory(); renderDeletedSales(); renderDebtors(); renderDebtPayments(); renderWarehouse(); renderSummary(); renderCashStatus(); renderHomeActions();
  cloudHydrated = true;
}

function startFirebaseRealtimeListener(options = {}) {
  if (typeof EventSource === 'undefined') return;
  const token = normalizedFirebaseToken();
  const useToken = Boolean(token) && options.forceNoToken !== true;
  const url = buildCloudRootUrl({ includeToken: useToken }) || buildCloudRootUrl({ includeToken: false });
  if (!url || (firebaseRealtimeListener && firebaseRealtimeListenerUrl === url)) return;
  if (firebaseRealtimeListener) {
    try { firebaseRealtimeListener.close(); } catch {}
    firebaseRealtimeListener = null;
  }
  firebaseRealtimeListenerUrl = url;
  try {
    firebaseRealtimeListener = new EventSource(url);
    console.info('[cloud][listener] conectado', { url });
    bootListenerReady = true;
    console.info('[boot][listener-ready]', { bootListenerReady, url });
    const handleEvent = () => {
      Promise.resolve().then(() => pullFromCloud({ force: true })).catch(() => {});
    };
    firebaseRealtimeListener.addEventListener('put', handleEvent);
    firebaseRealtimeListener.addEventListener('patch', handleEvent);
    firebaseRealtimeListener.onerror = () => {
      console.warn('[cloud][listener] desconectado, reintentando', { url, useToken });
      try { firebaseRealtimeListener?.close(); } catch {}
      firebaseRealtimeListener = null;
      if (realtimeReconnectTimer) clearTimeout(realtimeReconnectTimer);
      const shouldFallbackNoToken = useToken;
      realtimeReconnectTimer = setTimeout(() => startFirebaseRealtimeListener({ forceNoToken: shouldFallbackNoToken }), 2500);
    };
    console.info('[sync][realtime] Listener RTDB activo', { url, dbPath: state.settings?.firebaseDbPath });
  } catch (err) {
    console.error('[sync][realtime] No se pudo iniciar listener RTDB', err);
  }
}

async function pullFromCloudWithTimeout(timeoutMs = 1800) {
  const pullPromise = pullFromCloud({ force: true });
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, Math.max(300, Number(timeoutMs || 1800))));
  await Promise.race([pullPromise, timeoutPromise]);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('No se pudo convertir imagen.'));
    reader.readAsDataURL(blob);
  });
}

async function migrateCategoryImageRefsToDataUrls() {
  const entries = Object.entries(state.categoryImages || {}).filter(([, value]) => String(value || '').startsWith('idb:'));
  if (!entries.length) return false;
  let changed = false;
  for (const [category, ref] of entries) {
    try {
      const blob = await imageDbGet(String(ref).slice(4));
      if (!blob) continue;
      state.categoryImages[category] = await blobToDataUrl(blob);
      changed = true;
    } catch {}
  }
  if (changed) persist();
  return changed;
}

async function reserveNextOrderNumber(cashBoxId) {
  await ensureCloudSeedData();
  console.info('[sale][order-number] Reservando correlativo', saleDebugContext({ cashBoxId }));
  const fallback = () => {
    const lastIssued = Number(state.orderCounters?.[cashBoxId] || 0);
    const sessionCandidate = Number(state.cashSession?.orderCounter || 1);
    const next = lastIssued > 0 ? (lastIssued + 1) : (sessionCandidate > 0 ? sessionCandidate : 1);
    state.orderCounters = state.orderCounters || {};
    state.orderCounters[cashBoxId] = next;
    if (state.cashSession && state.cashSession.id === cashBoxId) state.cashSession.orderCounter = next + 1;
    return next;
  };
  const root = cloudRootUrl();
  if (!root || !cashBoxId) {
    console.error('[sale][order-number] fallback por datos faltantes', saleDebugContext({ cashBoxId, reason: !root ? 'sin_root' : 'sin_cashbox' }));
    return fallback();
  }
  const counterPath = encodeURIComponent(cashBoxId);
  const counterUrl = root.replace(/\.json(\?.*)?$/, `/orderCounters/${counterPath}.json$1`);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const getResp = await fetch(counterUrl, { headers: { 'X-Firebase-ETag': 'true' } });
    if (!getResp.ok) {
      console.error('[sale][order-number] GET counter falló', { status: getResp.status, counterUrl, cashBoxId });
      break;
    }
    const etag = getResp.headers.get('ETag') || '*';
    const current = Number(await getResp.json()) || 0;
    const next = current + 1;
    const putResp = await fetch(counterUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'if-match': etag },
      body: JSON.stringify(next)
    });
    if (putResp.status === 412) continue;
    if (!putResp.ok) {
      console.error('[sale][order-number] PUT counter falló', { status: putResp.status, counterUrl, cashBoxId });
      break;
    }
    state.orderCounters = state.orderCounters || {};
    state.orderCounters[cashBoxId] = next;
    if (state.cashSession && state.cashSession.id === cashBoxId) state.cashSession.orderCounter = next + 1;
    return next;
  }
  return fallback();
}

function persist(options = {}) {
  if (state.currentUser && !validateSessionPolicy({ silent: false })) return;
  if (options.module === 'users') console.info('[users][persist]', { usersCount: state.users?.length || 0 });
  if (options.module === 'settings') console.info('[settings][persist]', { title1: state.settings?.title1 || '', hasLogo: Boolean(state.settings?.logoDataUrl) });
  if (options.module === 'sale') console.info('[sale][persist]', { salesCount: state.sales?.length || 0, activeCashBoxId: state.activeCashBoxId || '' });
  saveLocalState();
  if (options.sync === false) return;
  if (!cloudHydrated) return;
  scheduleCloudSync(document.hidden ? 1200 : 600);
}

function defaultPermissions() {
  return { openCash: true, closeCash: true, deleteSales: true, accessSettings: true, manageProducts: true, manageCombos: true, editProductPrices: true, viewOrders: true, deleteClosings: true, deleteCashMovements: true, clearDeletedSalesHistory: true, manageUsers: true, viewSalesButton: true, viewSettingsButton: true, viewCloseCashButton: true, viewProductsTab: true, viewConfigVentasTab: true, viewDebtorsTab: true, viewSummaryTab: true, viewClosingsTab: true, viewWarehouseButton: true, viewSalesModeButton: true };
}

function ensureUsers() {
  if (!Array.isArray(state.users) || state.users.length === 0) {
    state.users = [{ username: 'admin', password: '5432', permissions: defaultPermissions(), createdBy: 'admin', enabled: true, lastActivityAt: Date.now(), lastLogoutAt: 0 }];
  }
  if (!state.users.find((u) => u.username === 'admin')) {
    state.users.push({ username: 'admin', password: '5432', permissions: defaultPermissions(), createdBy: 'admin', enabled: true, lastActivityAt: Date.now(), lastLogoutAt: 0 });
  }
  state.users = state.users.map((u) => ({
    ...u,
    permissions: { ...defaultPermissions(), ...(u.permissions || {}) },
    enabled: u.enabled !== false,
    lastActivityAt: Number(u.lastActivityAt || 0),
    lastLogoutAt: Number(u.lastLogoutAt || 0)
  }));
}

function currentUserRecord() {
  if (!state.currentUser?.username) return null;
  return state.users.find((u) => u.username === state.currentUser.username) || null;
}

function hasPermission(key) {
  const u = currentUserRecord();
  if (!u) return false;
  if (u.username === 'admin') return true;
  return Boolean(u.permissions?.[key]);
}

function canOpenCash() {
  return hasPermission('openCash') || hasPermission('authorizeCash');
}

function canCloseCash() {
  return hasPermission('closeCash') || hasPermission('authorizeCash');
}

function isAdminUser() {
  return state.currentUser?.username === 'admin';
}

function getCashBoxById(cashBoxId) {
  return (state.cashBoxes || []).find((box) => box.id === cashBoxId) || null;
}

function getActiveCashBox() {
  if (state.activeCashBoxId) {
    const box = getCashBoxById(state.activeCashBoxId);
    if (box && box.estado === 'ABIERTA') return box;
  }
  const fallback = (state.cashBoxes || []).find((box) => box.estado === 'ABIERTA') || null;
  if (fallback) state.activeCashBoxId = fallback.id;
  return fallback;
}

function isCashOpen() {
  return Boolean(getActiveCashBox());
}

function salesForActiveCashBox() {
  const list = Array.isArray(state.sales) ? state.sales : [];
  if (!state.activeCashBoxId) return [];
  return list.filter((sale) => sale.cashBoxId === state.activeCashBoxId);
}

function isSessionExpired() {
  const user = currentUserRecord();
  if (!state.currentUser || !user) return false;
  if (user.enabled === false) return true;
  const ref = Math.max(
    Number(user.lastActivityAt || 0),
    Number(state.currentUser.lastActivityAt || 0),
    Number(state.currentUser.loginAt || 0)
  );
  if (!ref) return false;
  return (Date.now() - ref) >= SESSION_INACTIVITY_LIMIT_MS;
}

function markUserActivity(reason = 'actividad') {
  if (!state.currentUser) return;
  const now = Date.now();
  state.currentUser.lastActivityAt = now;
  const user = currentUserRecord();
  if (user) user.lastActivityAt = now;
  saveLocalState();
}

function touchSessionActivity() {
  if (!state.currentUser) return;
  validateSessionPolicy({ silent: true });
}

function humanElapsed(ts) {
  const ms = Math.max(0, Date.now() - Number(ts || 0));
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Hace menos de 1 minuto';
  if (m < 60) return `Hace ${m} minuto${m === 1 ? '' : 's'}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} hora${h === 1 ? '' : 's'}`;
  const d = Math.floor(h / 24);
  return `Hace ${d} día${d === 1 ? '' : 's'}`;
}

function validateSessionPolicy({ silent = false } = {}) {
  if (!state.currentUser) return true;
  const user = currentUserRecord();
  if (!user) {
    logout('Sesión inválida. Vuelve a iniciar sesión.');
    return false;
  }
  if (user.enabled === false) {
    user.lastLogoutAt = Date.now();
    saveLocalState();
    logout('Usuario inhabilitado por administrador.');
    return false;
  }
  const loginAt = Number(state.currentUser.loginAt || 0);
  const forcedAt = Number(state.forceLogoutAt || 0);
  if (forcedAt && loginAt && loginAt <= forcedAt) {
    user.lastLogoutAt = Date.now();
    saveLocalState();
    logout('La caja fue cerrada globalmente. Debes iniciar sesión nuevamente.');
    return false;
  }
  const last = Math.max(
    Number(user.lastActivityAt || 0),
    Number(state.currentUser.lastActivityAt || 0),
    loginAt
  );
  if (last && (Date.now() - last) >= SESSION_INACTIVITY_LIMIT_MS) {
    user.lastLogoutAt = Date.now();
    saveLocalState();
    logout('Sesión expirada por inactividad (3 horas).');
    return false;
  }
  if (!silent) markUserActivity('request');
  return true;
}

function beginSessionWatcher() {
  if (sessionWatchInterval) clearInterval(sessionWatchInterval);
  sessionWatchInterval = setInterval(() => {
    if (!state.currentUser) return;
    validateSessionPolicy({ silent: true });
  }, 60 * 1000);
}

function normalizeCashState() {
  if (!Array.isArray(state.cashBoxes)) state.cashBoxes = [];
  const openBoxes = state.cashBoxes.filter((box) => box.estado === 'ABIERTA');
  if (openBoxes.length > 1) {
    const keep = openBoxes[0];
    state.cashBoxes = state.cashBoxes.map((box, idx) => (idx > 0 && box.estado === 'ABIERTA' ? { ...box, estado: 'CERRADA', fecha_cierre: box.fecha_cierre || new Date().toISOString() } : box));
    state.activeCashBoxId = keep.id;
  }
  const activeCash = getActiveCashBox();
  if (!activeCash) {
    state.activeCashBoxId = '';
    state.systemStatus = 'CAJA_CERRADA';
    state.cashSession = null;
  } else {
    state.activeCashBoxId = activeCash.id;
    state.systemStatus = 'CAJA_ABIERTA';
    if (!state.cashSession || state.cashSession.id !== activeCash.id) {
      state.cashSession = { id: activeCash.id, openedAt: activeCash.fecha_apertura, openingCash: Number(activeCash.openingCash || 0), orderCounter: 1 };
    }
  }
}

function ensureSeedData() {
  if (!Array.isArray(state.categories) || !state.categories.length) state.categories = ['Todos', 'Bebidas', 'Comidas'];
  if (!state.categories.includes('Todos')) state.categories.unshift('Todos');
  if (!Array.isArray(state.products) || !state.products.length) {
    state.products = [
      { id: uid(), category: 'Bebidas', name: 'Mocochinchi', price: 5, hidden: false },
      { id: uid(), category: 'Comidas', name: 'Sandwich', price: 12, hidden: false }
    ];
  }
}


function ensureProductStockDefaults() {
  state.products = (state.products || []).map((p) => ({ ...p, stockCurrent: Number(p.stockCurrent || 0) }));
}


function normalizePeopleData() {
  if (!Array.isArray(state.people)) state.people = [];
  if (!Array.isArray(state.removedPeopleIds)) state.removedPeopleIds = [];
  const removed = new Set(state.removedPeopleIds.map((x) => String(x || '')));
  state.people = state.people.filter((p) => p && !removed.has(String(p.id || '')));
}

function ensurePeopleData() {
  if (!Array.isArray(state.people)) state.people = [];
  let changed = false;
  state.people = state.people.map((person) => {
    if (person?.id) return person;
    changed = true;
    return { id: uid(), ...person };
  });
  if (changed) saveLocalState();
}

function currentSalesMode() {
  const username = state.currentUser?.username || '';
  if (!username) return 'generic';
  if (!hasPermission('viewSalesModeButton')) return 'generic';
  return state.userSalesModes?.[username] === 'touch' ? 'touch' : 'generic';
}

function getTouchUiConfig() {
  const username = state.currentUser?.username || '';
  if (!username) return { grid: '3x3', cartPosition: 'right' };
  const cfg = state.touchUiConfigByUser?.[username] || {};
  const grid = ['2x3','3x2','3x3','4x2','4x3','4x4','2x4','5x3','5x4'].includes(cfg.grid) ? cfg.grid : '3x3';
  const cartPosition = ['left','right','bottom'].includes(cfg.cartPosition) ? cfg.cartPosition : 'right';
  return { grid, cartPosition };
}

function setSalesModeForCurrentUser(mode) {
  const username = state.currentUser?.username || '';
  if (!username) return;
  if (!state.userSalesModes || typeof state.userSalesModes !== 'object') state.userSalesModes = {};
  state.userSalesModes[username] = mode === 'touch' ? 'touch' : 'generic';
  persist();
}

function setTouchUiConfigForCurrentUser(patch = {}) {
  const username = state.currentUser?.username || '';
  if (!username) return;
  if (!state.touchUiConfigByUser || typeof state.touchUiConfigByUser !== 'object') state.touchUiConfigByUser = {};
  const next = { ...getTouchUiConfig(), ...patch };
  state.touchUiConfigByUser[username] = next;
  persist();
}

function saleTotals() {
  const gross = state.currentCart.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = state.currentCart.reduce((a, i) => a + (i.price * i.qty * (i.discountPct || 0) / 100), 0);
  const final = state.currentCart.reduce((a, i) => a + Number(i.finalSubtotal ?? ((i.price * i.qty) - (i.price * i.qty * (i.discountPct || 0) / 100))), 0);
  return { gross, discount, final: Math.max(0, final) };
}

function renderCart() {
  if (!cartTable) return;
  cartTable.innerHTML = '';
  if (!state.currentCart.length) cartTable.innerHTML = '<tr><td colspan="7">No hay productos añadidos.</td></tr>';
  state.currentCart.forEach((item) => {
    const total = item.price * item.qty;
    const subtotal = total - (total * (item.discountPct || 0) / 100);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatProductWithComboDetails(item)}</td><td><input type="number" min="1" step="1" value="${item.qty}" data-id="${item.id}" data-act="qty" /></td><td>${money(item.price)}</td><td>${money(total)}</td><td><input type="number" min="0" max="100" value="${item.discountPct || 0}" data-id="${item.id}" data-act="disc" /></td><td><input type="number" min="0" step="0.01" value="${Number(item.finalSubtotal ?? subtotal).toFixed(2)}" data-id="${item.id}" data-act="subtotal" /></td><td><button class="secondary" data-id="${item.id}" data-act="rm" type="button">Quitar</button></td>`;
    cartTable.appendChild(tr);
  });
  const totals = saleTotals();
  if (saleGrossTotal) saleGrossTotal.textContent = money(totals.gross);
  if (saleDiscountTotal) saleDiscountTotal.textContent = money(totals.discount);
  if (saleFinalTotal) saleFinalTotal.textContent = money(totals.final);
  if (mixedQrAutoAmount) mixedQrAutoAmount.value = money(Math.max(0, totals.final - Number(cashAmount?.value || 0)));
  if (cashTotalDisplay) cashTotalDisplay.value = money(totals.final);
  if (cashChangeDisplay) cashChangeDisplay.value = money(Math.max(0, Number(cashPaidInput?.value || 0) - totals.final));
  if (!state.currentCart.length) saleProceedReady = false;
  if (currentSalesMode() === 'touch') renderTouchSaleUi();
  syncSaleSubmitVisibility();
}

function renderSaleSelectors() {
  if (!saleCategoryButtons || !saleCategorySelectors) return;
  const cats = [...new Set(state.products.filter((p) => !p.hidden).map((p) => p.category))];
  if (!cats.length) {
    saleCategoryButtons.innerHTML = '<p>Sin categorías.</p>';
    saleCategorySelectors.innerHTML = '';
    return;
  }
  if (activeSaleCategory && !cats.includes(activeSaleCategory)) activeSaleCategory = '';
  saleCategoryButtons.innerHTML = '';
  cats.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `secondary tab ${c === activeSaleCategory ? 'active' : ''}`;
    b.textContent = c;
    b.addEventListener('click', () => { activeSaleCategory = c; renderSaleSelectors(); });
    saleCategoryButtons.appendChild(b);
  });
  const list = activeSaleCategory ? state.products.filter((p) => {
    if (p.hidden || p.category !== activeSaleCategory) return false;
    if (!isStockEnabled()) return true;
    return Number(p.stockCurrent || 0) > 0;
  }) : [];
  saleCategorySelectors.innerHTML = `<div class="card grid4"><label>Producto<select id="catProductSel"><option value="">Selecciona un producto</option>${list.map((p) => { const stock = Number(p.stockCurrent || 0); const noStock = isStockEnabled() && stock <= 0; const lowStock = isStockEnabled() && stock > 0 && stock <= Number(appConfig.stockMinimo || 0); const suffix = isStockEnabled() ? (noStock ? ' (Sin stock)' : (lowStock ? ` (Stock = ${stock})` : '')) : ''; const style = isStockEnabled() ? (noStock ? 'color:#c62f2f;' : (lowStock ? 'color:#b26a00;' : '')) : ''; return `<option value="${p.id}" ${noStock ? 'disabled' : ''} style="${style}">${p.name}${suffix} · ${money(p.price)}</option>`; }).join('')}</select></label><label>Cantidad<input id="catQty" type="number" min="1" step="1" value="1" /></label><label>Subtotal<input id="catSub" type="text" readonly value="${money(0)}" /></label><button id="catAdd" class="primary" type="button">Añadir</button></div>`;
  const sel = $('catProductSel');
  const qty = $('catQty');
  const sub = $('catSub');
  const sync = () => {
    const p = state.products.find((x) => x.id === sel?.value);
    if (sub) sub.value = money((p?.price || 0) * Math.max(1, Number(qty?.value || 1)));
  };
  sel?.addEventListener('change', sync);
  qty?.addEventListener('input', sync);
  $('catAdd')?.addEventListener('click', () => {
    const p = state.products.find((x) => x.id === sel?.value);
    const q = Math.max(1, Number(qty?.value || 1));
    if (!p) return alert('Selecciona un producto.');
    if (isStockEnabled() && q > Number(p.stockCurrent || 0)) return alert('Cantidad solicitada supera el stock disponible.');
    if (isStockEnabled() && Array.isArray(p.combo) && p.combo.length) {
      const req = comboComponentRequirements(p, q);
      const missing = [...req.entries()].find(([componentId, neededQty]) => {
        const component = state.products.find((x) => x.id === componentId);
        return Number(component?.stockCurrent || 0) < Number(neededQty || 0);
      });
      if (missing) {
        const component = state.products.find((x) => x.id === missing[0]);
        return alert(`Stock insuficiente para producto del combo: ${component?.name || 'Componente'}.`);
      }
    }
    const e = state.currentCart.find((i) => i.id === p.id);
    if (e) {
      e.qty += q;
      const total = Number(e.price || 0) * Number(e.qty || 0);
      e.finalSubtotal = total - (total * Number(e.discountPct || 0) / 100);
    } else state.currentCart.push({ id: p.id, name: p.name, price: Number(p.price || 0), qty: q, discountPct: 0, finalSubtotal: Number(p.price || 0) * q });
    activeSaleCategory = '';
    renderSaleSelectors();
    renderCart();
    syncSaleUiModeVisibility();
  });
}


function ensureSalesModeButton() {
  if (!homeScreen || document.getElementById('goSalesModeBtn')) return;
  const actions = homeScreen.querySelector('.home-actions');
  if (!actions) return;
  const btn = document.createElement('button');
  btn.id = 'goSalesModeBtn';
  btn.type = 'button';
  btn.className = 'secondary';
  btn.textContent = 'Modo de ventas';
  actions.appendChild(btn);
}

function openSalesModeScreen() {
  if (!hasPermission('viewSalesModeButton')) {
    setMsg(homeMessage, 'No tienes permiso para Modo de ventas.', false);
    navigateTo('home', { replace: true });
    return;
  }
  document.getElementById('salesModeOverlay')?.remove();
  const cfg = getTouchUiConfig();
  const mode = currentSalesMode();
  const overlay = document.createElement('div');
  overlay.id = 'salesModeOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Modo de ventas</h3><div class="grid2"><button id="activateGenericModeBtn" class="${mode === 'generic' ? 'primary' : 'secondary'}" type="button">${mode === 'generic' ? 'Desactivar' : 'Activar'} modo genérico</button><button id="activateTouchModeBtn" class="${mode === 'touch' ? 'primary' : 'secondary'}" type="button">${mode === 'touch' ? 'Desactivar' : 'Activar'} modo táctil</button></div><div id="touchModeConfigWrap" class="${mode === 'touch' ? '' : 'hidden'}"><h4>Configuración modo táctil</h4><div class="grid2"><label>Tamaño o estilo visual<select id="touchGridPresetSel"><option value="2x3">2x3</option><option value="3x2">3x2</option><option value="3x3">3x3</option><option value="4x2">4x2</option><option value="4x3">4x3</option><option value="4x4">4x4</option><option value="2x4">2x4</option><option value="5x3">5x3</option><option value="5x4">5x4</option></select></label><label>Lista de compras<select id="touchCartPosSel"><option value="left">Lateral izquierdo</option><option value="right">Lateral derecho</option><option value="bottom">Abajo</option></select></label></div></div><button id="closeSalesModeOverlayBtn" class="secondary" type="button">Cerrar</button></div>`;
  document.body.appendChild(overlay);
  const gridSel = document.getElementById('touchGridPresetSel');
  const posSel = document.getElementById('touchCartPosSel');
  if (gridSel) gridSel.value = cfg.grid;
  if (posSel) posSel.value = cfg.cartPosition;
  document.getElementById('activateGenericModeBtn')?.addEventListener('click', () => { setSalesModeForCurrentUser('generic'); syncSaleUiModeVisibility(); overlay.remove(); });
  document.getElementById('activateTouchModeBtn')?.addEventListener('click', () => {
    setSalesModeForCurrentUser('touch');
    setTouchUiConfigForCurrentUser({ grid: gridSel?.value || cfg.grid, cartPosition: posSel?.value || cfg.cartPosition });
    syncSaleUiModeVisibility();
    syncSaleSubmitVisibility();
    overlay.remove();
  });
  gridSel?.addEventListener('change', () => setTouchUiConfigForCurrentUser({ grid: gridSel.value }));
  posSel?.addEventListener('change', () => setTouchUiConfigForCurrentUser({ cartPosition: posSel.value }));
  document.getElementById('closeSalesModeOverlayBtn')?.addEventListener('click', () => overlay.remove());
}

function touchGridCapacity() {
  const [c, r] = getTouchUiConfig().grid.split('x').map((n) => Number(n || 3));
  return Math.max(1, c * r);
}


function openTouchItemTools(itemId) {
  const item = state.currentCart.find((x) => x.id === itemId);
  if (!item) return;
  document.getElementById('touchToolsOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'touchToolsOverlay';
  overlay.className = 'modal';
  const defaultSubtotal = Number(item.price || 0) * Number(item.qty || 1);
  overlay.innerHTML = `<div class="modal-card"><h3>Herramienta: ${item.name}</h3><div class="grid2"><label>Descuento %<input id="touchToolDisc" type="number" min="0" max="100" value="${Number(item.discountPct || 0)}" /></label><label>Precio unitario<input id="touchToolUnit" type="number" min="0" step="0.01" value="${Number(item.price || 0).toFixed(2)}" /></label></div><p>Subtotal base: ${money(defaultSubtotal)}</p><div class="grid2"><button id="touchToolApplyBtn" class="primary" type="button">Aplicar</button><button id="touchToolCancelBtn" class="secondary" type="button">Cancelar</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('touchToolApplyBtn')?.addEventListener('click', () => {
    item.discountPct = Math.max(0, Math.min(100, Number(document.getElementById('touchToolDisc')?.value || 0)));
    item.price = Math.max(0, Number(document.getElementById('touchToolUnit')?.value || item.price || 0));
    const total = Number(item.price || 0) * Number(item.qty || 1);
    item.finalSubtotal = total - (total * Number(item.discountPct || 0) / 100);
    renderCart();
    renderTouchSaleUi();
    overlay.remove();
  });
  document.getElementById('touchToolCancelBtn')?.addEventListener('click', () => overlay.remove());
}

function renderTouchSaleUi() {
  if (!saleFormContainer || currentSalesMode() !== 'touch') return;
  let host = document.getElementById('touchSalesContainer');
  if (!host) {
    host = document.createElement('div');
    host.id = 'touchSalesContainer';
    saleFormContainer.prepend(host);
  }
  const cfg = getTouchUiConfig();
  const cap = touchGridCapacity();
  const cats = [...new Set(state.products.filter((p) => !p.hidden).map((p) => p.category))];
  state.touchUiState = state.touchUiState || { view: 'categories', category: '', page: 0 };
  const ui = state.touchUiState;
  if (!cats.includes(ui.category)) { ui.category = ''; ui.view = 'categories'; ui.page = 0; }
  const list = ui.view === 'categories' ? cats : state.products.filter((p) => !p.hidden && p.category === ui.category).filter((p) => !isStockEnabled() || Number(p.stockCurrent || 0) > 0);
  const pages = Math.max(1, Math.ceil(list.length / cap));
  if (ui.page >= pages) ui.page = 0;
  const pageItems = list.slice(ui.page * cap, (ui.page + 1) * cap);
  const renderCard = (item) => {
    if (ui.view === 'categories') {
      const hasImg = Boolean(state.categoryImages?.[item]);
      const categorySrc = resolveImageSource(state.categoryImages[item]);
      const img = categorySrc ? `<img class=\"touch-media\" src=\"${categorySrc}\" alt=\"${item}\" loading=\"lazy\" />` : '';
      return `<button class="touch-card ${hasImg ? 'with-image' : 'no-image'}" data-touch-cat="${item}" type="button">${img}<strong class="touch-card-title">${item}</strong></button>`;
    }
    const productSrc = resolveImageSource(item.imageUrl || item.imageDataUrl);
    const hasImg = Boolean(productSrc);
    const img = productSrc ? `<img class=\"touch-media\" src=\"${productSrc}\" alt=\"${item.name}\" loading=\"lazy\" />` : '';
    const stock = Number(item.stockCurrent || 0);
    const lowStock = isStockEnabled() && stock > 0 && stock <= Number(appConfig.stockMinimo || 0);
    const stockBadge = lowStock ? `<small class=\"stock-warning\">Stock: ${stock}</small>` : '';
    return `<button class="touch-card ${hasImg ? 'with-image' : 'no-image'} ${lowStock ? 'stock-empty' : ''}" data-touch-prod="${item.id}" type="button">${img}<strong class="touch-card-title">${item.name}</strong><span class="touch-card-price">${money(item.price)}</span>${stockBadge}</button>`;
  };
  host.className = `touch-sales-layout cart-${cfg.cartPosition}`;
  host.innerHTML = `<div class="touch-main"><div class="touch-toolbar">${ui.view === 'products' ? '<button id="touchBackToCats" class="secondary" type="button">Volver a categorías</button>' : '<span></span>'}<div class="touch-pager"><button id="touchPrevPage" class="secondary" type="button">◀</button><span>Página ${ui.page + 1}/${pages}</span><button id="touchNextPage" class="secondary" type="button">▶</button></div></div><div class="touch-grid" style="--touch-cols:${getTouchUiConfig().grid.split('x')[0]};">${pageItems.map(renderCard).join('')}</div></div><aside class="touch-cart"><h3>Lista de compras</h3><div class="touch-cart-items">${state.currentCart.length ? state.currentCart.map((i) => `<div class="touch-cart-item"><div><strong>${i.name}</strong><small>${money(i.price)} c/u · Total ${money(Number(i.finalSubtotal ?? (i.price*i.qty)))}</small></div><div class="touch-qty"><button data-touch-dec="${i.id}" type="button">-</button><span>${i.qty}</span><button data-touch-inc="${i.id}" type="button">+</button><button data-touch-tools="${i.id}" type="button">🛠</button><button data-touch-rm="${i.id}" type="button">✕</button></div></div>`).join('') : '<p>Sin productos añadidos.</p>'}</div><div class="touch-summary"><p>Subtotal: ${money(saleTotals().gross)}</p><p>Descuento: ${money(saleTotals().discount)}</p><p><strong>Total: ${money(saleTotals().final)}</strong></p></div><button id="touchProceedPayBtn" class="primary" type="button">Proceder con el pago</button><div class="grid2"><button id="touchQueueBtn" class="secondary" type="button">Añadir a la cola</button><button id="touchQueuedBtn" class="secondary" type="button">Ver pedidos pendientes</button></div><div class="touch-finance"><small>Total de caja: ${cashTotalBox?.textContent || money(0)}</small><small>Cambio final más efectivo del día: ${summaryFinalCash?.textContent || money(0)}</small><small>Total de QR del día: ${summaryFinalQr?.textContent || money(0)}</small></div></aside>`;

  host.querySelector('#touchBackToCats')?.addEventListener('click', () => { ui.view = 'categories'; ui.page = 0; renderTouchSaleUi(); });
  host.querySelector('#touchPrevPage')?.addEventListener('click', () => { ui.page = (ui.page - 1 + pages) % pages; renderTouchSaleUi(); });
  host.querySelector('#touchNextPage')?.addEventListener('click', () => { ui.page = (ui.page + 1) % pages; renderTouchSaleUi(); });
  host.querySelectorAll('[data-touch-cat]').forEach((b) => b.addEventListener('click', () => { ui.view = 'products'; ui.category = b.dataset.touchCat || ''; ui.page = 0; renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-prod]').forEach((b) => b.addEventListener('click', () => {
    const p = state.products.find((x) => x.id === b.dataset.touchProd);
    if (!p) return;
    if (isStockEnabled() && Number(p.stockCurrent || 0) <= 0) return alert('Producto sin stock disponible.');
    const e = state.currentCart.find((i) => i.id === p.id);
    if (e) e.qty += 1; else state.currentCart.push({ id: p.id, name: p.name, price: Number(p.price || 0), qty: 1, discountPct: 0, finalSubtotal: Number(p.price || 0) });
    const item = state.currentCart.find((i) => i.id === p.id);
    const total = item.price * item.qty;
    item.finalSubtotal = total - (total * (item.discountPct || 0) / 100);
    ui.view = 'categories';
    ui.category = '';
    ui.page = 0;
    renderCart();
    renderTouchSaleUi();
  }));
  host.querySelectorAll('[data-touch-inc]').forEach((b) => b.addEventListener('click', () => { const i = state.currentCart.find((x) => x.id === b.dataset.touchInc); if (!i) return; const p = state.products.find((x) => x.id === i.id); if (isStockEnabled() && Number(i.qty || 0) >= Number(p?.stockCurrent || 0)) return alert('Stock insuficiente para agregar producto.'); i.qty += 1; i.finalSubtotal = i.price*i.qty - (i.price*i.qty*(i.discountPct||0)/100); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-dec]').forEach((b) => b.addEventListener('click', () => { const i = state.currentCart.find((x) => x.id === b.dataset.touchDec); if (!i) return; i.qty = Math.max(1, i.qty-1); i.finalSubtotal = i.price*i.qty - (i.price*i.qty*(i.discountPct||0)/100); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-rm]').forEach((b) => b.addEventListener('click', () => { state.currentCart = state.currentCart.filter((x) => x.id !== b.dataset.touchRm); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-tools]').forEach((b) => b.addEventListener('click', () => openTouchItemTools(b.dataset.touchTools)));
  host.querySelector('#touchProceedPayBtn')?.addEventListener('click', () => { const paymentCard = paymentType?.closest('.card'); paymentCard?.classList.remove('hidden'); paymentType?.scrollIntoView({ behavior:'smooth', block:'center' }); saleProceedReady = true; syncSaleSubmitVisibility(); });
  host.querySelector('#touchQueueBtn')?.addEventListener('click', queueCurrentSaleDraft);
  host.querySelector('#touchQueuedBtn')?.addEventListener('click', openQueuedOrdersModal);
}

function setSaleModeDomVisibility() {
  const touch = currentSalesMode() === 'touch';
  const genericBlocks = [
    saleCategoryButtons?.closest('.card') || null,
    cartTable?.closest('table') || null,
    saleGrossTotal?.closest('.total-card') || null,
    paymentType?.closest('.card') || null
  ].filter(Boolean);
  genericBlocks.forEach((el) => el.classList.toggle('hidden', touch));
  if (touch) {
    renderTouchSaleUi();
  } else {
    document.getElementById('touchSalesContainer')?.remove();
  }
}

function syncSaleUiModeVisibility() {
  setSaleModeDomVisibility();
}

function openImageDb() {
  if (imageDbPromise) return imageDbPromise;
  imageDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IMAGE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IMAGE_DB_STORE)) db.createObjectStore(IMAGE_DB_STORE);
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onclose = () => { imageDbPromise = null; };
      resolve(db);
    };
    req.onerror = () => {
      imageDbPromise = null;
      reject(req.error || new Error('No se pudo abrir IndexedDB de imágenes.'));
    };
  });
  return imageDbPromise;
}

async function imageDbPut(key, blob) {
  const db = await openImageDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_DB_STORE, 'readwrite');
    tx.objectStore(IMAGE_DB_STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Error guardando imagen en IndexedDB.'));
  });
}

async function imageDbGet(key) {
  const db = await openImageDb();
  const out = await new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_DB_STORE, 'readonly');
    const req = tx.objectStore(IMAGE_DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('Error leyendo imagen de IndexedDB.'));
  });
  return out;
}

async function imageDbDelete(key) {
  if (!key) return;
  const db = await openImageDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_DB_STORE, 'readwrite');
    tx.objectStore(IMAGE_DB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Error eliminando imagen de IndexedDB.'));
  });
}

function scheduleImageUiRefresh({ products = false, touch = false } = {}) {
  if (scheduledImageUiRefresh) return;
  scheduledImageUiRefresh = window.requestAnimationFrame(() => {
    scheduledImageUiRefresh = 0;
    if (products && productListCard && !productListCard.classList.contains('hidden')) renderProducts();
    if (touch && currentSalesMode() === 'touch') renderTouchSaleUi();
  });
}

function imageRefKey(value) {
  return String(value || '').startsWith('idb:') ? String(value).slice(4) : '';
}

function clearImageMissingRef(value) {
  const raw = String(value || '');
  if (!raw || !raw.startsWith('idb:')) return;
  delete imageMissingRefs[raw];
}

function markImageMissingRef(value) {
  const raw = String(value || '');
  if (!raw || !raw.startsWith('idb:')) return;
  const prev = imageMissingRefs[raw] || { attempts: 0, lastAttemptAt: 0, missing: false };
  imageMissingRefs[raw] = { missing: true, attempts: Number(prev.attempts || 0) + 1, lastAttemptAt: Date.now() };
}

function forceRetryImageRef(value) {
  const raw = String(value || '');
  if (!raw || !raw.startsWith('idb:')) return;
  clearImageMissingRef(raw);
  delete imageLoadInFlight[raw];
  resolveImageSource(raw);
  scheduleImageUiRefresh({ products: true, touch: true });
}

function resolveImageSource(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
  return '';
}

async function saveImageFileToStorage(file, previousValue = '', options = {}) {
  const kind = options.kind || 'product';
  const key = options.key || uid();
  try {
    return await uploadImageToFirebaseStorage({
      kind,
      key,
      file,
      previousUrl: previousValue,
      onProgress: options.onProgress || null
    });
  } catch (err) {
    const optimized = await optimizeImageForUpload(file, { maxSize: kind === 'category' ? 400 : 300 });
    return blobToDataUrl(optimized.blob);
  }
}

function imageUploadKey(kind, key) {
  return `${kind}:${String(key || '')}`;
}

function setImageUploadStatus(kind, key, patch = null) {
  const map = imageUploadStatus[kind] || {};
  if (!patch) {
    delete map[imageUploadKey(kind, key)];
  } else {
    const prev = map[imageUploadKey(kind, key)] || {};
    map[imageUploadKey(kind, key)] = { ...prev, ...patch };
  }
  imageUploadStatus[kind] = map;
  scheduleImageUiRefresh({ products: true });
}

function getImageUploadStatus(kind, key) {
  return imageUploadStatus[kind]?.[imageUploadKey(kind, key)] || null;
}

function validateImageFile(file) {
  if (!file) return 'No se seleccionó archivo.';
  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();
  const extOk = /\.(jpg|jpeg|png)$/.test(name);
  const mimeOk = ['image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg'].includes(type) || type.startsWith('image/');
  if (!(extOk || mimeOk)) return 'Archivo inválido. Solo se permiten JPG, JPEG y PNG.';
  return '';
}

function renderImageUploadProgress(kind, key) {
  const st = getImageUploadStatus(kind, key);
  if (!st || !st.uploading) return '';
  const pct = Math.max(0, Math.min(100, Math.round(Number(st.progress || 0))));
  return `<div class="upload-progress-wrap"><div class="upload-progress-label">Subiendo... ${pct}%</div><div class="upload-progress"><span style="width:${pct}%"></span></div></div>`;
}


function persistImageChange(onRollback) {
  try {
    // Guardado local directo para evitar estados "subidos" que luego se pierden.
    state.lastSyncAt = Math.max(Number(state.lastSyncAt || 0), Date.now());
    saveLocalState();
    // Sincronización remota en segundo plano (no bloqueante).
    scheduleCloudSync(document.hidden ? 3500 : 1200);
    return true;
  } catch (error) {
    if (typeof onRollback === 'function') onRollback();
    console.error('[image-upload] persist error', error);
    setMsg(homeMessage, 'No se pudo guardar la imagen. Intenta con una imagen más ligera.', false);
    return false;
  }
}

function beginImageUpload(kind, key, file, onDone) {
  const validationError = validateImageFile(file);
  if (validationError) {
    setImageUploadStatus(kind, key, { uploading: false, progress: 0, error: validationError });
    setTimeout(() => setImageUploadStatus(kind, key, null), 2200);
    setMsg(homeMessage, validationError, false);
    return;
  }
  const startedAt = Date.now();
  const uploadId = uid();
  setImageUploadStatus(kind, key, { uploading: true, progress: 2, error: '', uploadId });
  const reader = new FileReader();
  reader.onprogress = (event) => {
    const st = getImageUploadStatus(kind, key);
    if (!st?.uploading || st.uploadId !== uploadId) return;
    if (!event.lengthComputable) return;
    const pct = Math.max(2, Math.min(95, Math.round((event.loaded / event.total) * 100)));
    setImageUploadStatus(kind, key, { uploading: true, progress: pct, error: '', uploadId });
  };
  reader.onerror = () => {
    const st = getImageUploadStatus(kind, key);
    if (!st?.uploading || st.uploadId !== uploadId) return;
    setImageUploadStatus(kind, key, { uploading: false, progress: 0, error: 'No se pudo cargar la imagen.', uploadId: '' });
    setTimeout(() => setImageUploadStatus(kind, key, null), 2200);
  };
  reader.onload = () => {
    const st = getImageUploadStatus(kind, key);
    if (!st?.uploading || st.uploadId !== uploadId) return;
    const finish = async () => {
      try { await onDone({ file, dataUrl: String(reader.result || '') }); }
      finally {
        const current = getImageUploadStatus(kind, key);
        if (current?.uploadId === uploadId) setImageUploadStatus(kind, key, null);
      }
    };
    const elapsed = Date.now() - startedAt;
    const waitMs = Math.max(0, 800 - elapsed);
    setImageUploadStatus(kind, key, { uploading: true, progress: 100, error: '', uploadId });
    setTimeout(() => { finish(); }, waitMs);
  };
  reader.readAsDataURL(file);
}

function openImageUploadForProduct(productId) {
  const p = state.products.find((x) => x.id === productId);
  if (!p) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', () => {
    const f = input.files?.[0];
    if (input) input.value = '';
    beginImageUpload('product', productId, f, async (payload) => {
      const previous = p.imageUrl || p.imageDataUrl || '';
      try {
        p.imageUrl = await saveImageFileToStorage(payload.file, previous, {
          kind: 'product',
          key: p.id,
          onProgress: (pct) => setImageUploadStatus('product', productId, { uploading: true, progress: Math.max(2, Math.min(100, pct)), error: '' })
        });
        delete p.imageDataUrl;
      } catch (err) {
        p.imageUrl = previous;
        setImageUploadStatus('product', productId, { uploading: false, progress: 0, error: String(err?.message || 'No se pudo subir la imagen.') });
        setTimeout(() => setImageUploadStatus('product', productId, null), 4000);
        return;
      }
      const ok = persistImageChange(() => { p.imageUrl = previous; });
      if (!ok) {
        setImageUploadStatus('product', productId, { uploading: false, progress: 0, error: 'No se pudo guardar la imagen de forma persistente.' });
        setTimeout(() => setImageUploadStatus('product', productId, null), 2400);
      }
      renderProducts();
      renderSaleSelectors();
      renderTouchSaleUi();
    });
  });
  input.click();
}

function openImageUploadForCategory(categoryName) {
  if (!categoryName) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', () => {
    const f = input.files?.[0];
    if (input) input.value = '';
    beginImageUpload('category', categoryName, f, async (payload) => {
      const previous = state.categoryImages[categoryName] || '';
      try {
        state.categoryImages[categoryName] = await saveImageFileToStorage(payload.file, previous, {
          kind: 'category',
          key: categoryName,
          onProgress: (pct) => setImageUploadStatus('category', categoryName, { uploading: true, progress: Math.max(2, Math.min(100, pct)), error: '' })
        });
      } catch (err) {
        state.categoryImages[categoryName] = previous;
        setImageUploadStatus('category', categoryName, { uploading: false, progress: 0, error: String(err?.message || 'No se pudo subir la imagen.') });
        setTimeout(() => setImageUploadStatus('category', categoryName, null), 4000);
        return;
      }
      const ok = persistImageChange(() => {
        if (previous) state.categoryImages[categoryName] = previous;
        else delete state.categoryImages[categoryName];
      });
      if (!ok) {
        setImageUploadStatus('category', categoryName, { uploading: false, progress: 0, error: 'No se pudo guardar la imagen de forma persistente.' });
        setTimeout(() => setImageUploadStatus('category', categoryName, null), 2400);
      }
      renderProducts();
      renderTouchSaleUi();
    });
  });
  input.click();
}

function renderOrders(finalized = false) {
  if (!ordersTable) return;
  const q = (orderSearchInput?.value || '').trim();
  const base = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt).slice();
  let pending = base.filter((s) => s.orderStatus !== 'finalizado');
  let done = base.filter((s) => s.orderStatus === 'finalizado');
  if (q) {
    pending = pending.filter((s) => String(s.orderNumber).includes(q));
    done = done.filter((s) => String(s.orderNumber).includes(q));
  }
  const list = finalized ? done : pending;
  ordersTable.innerHTML = list.length ? list.map((s) => `<tr><td>#${orderNumberLabel(s.orderNumber)}</td><td>${money(s.total)}</td><td>${s.user}</td><td><button class=\"secondary\" data-order-id=\"${s.id}\" type=\"button\">Desarrollar entrega</button></td></tr>`).join('') : '<tr><td colspan="4">No hay pedidos.</td></tr>';
  if (finalizedOrdersTable) finalizedOrdersTable.innerHTML = done.length ? done.map((s) => `<tr><td>#${orderNumberLabel(s.orderNumber)}</td><td>${money(s.total)}</td><td>${s.user}</td><td><button class=\"secondary\" data-final-edit=\"${s.id}\" type=\"button\">Modificar</button></td></tr>`).join('') : '<tr><td colspan="4">Sin pedidos finalizados.</td></tr>';
}



function openOrderDetails(orderId) {
  const sale = state.sales.find((s) => s.id === orderId);
  if (!sale || !orderDetailsCard) return;
  activeOrderId = orderId;
  orderDetailsCard.classList.remove('hidden');
  ordersTable?.closest('table')?.classList.add('hidden');
  finalizedOrdersTable?.closest('table')?.classList.add('hidden');
  if (orderDetailsTitle) orderDetailsTitle.textContent = `Pedido #${orderNumberLabel(sale.orderNumber)}`;
  const pending = sale.deliveryItems.filter((i) => !i.delivered);
  const done = sale.deliveryItems.filter((i) => i.delivered);
  if (pendingOrderItemsTable) pendingOrderItemsTable.innerHTML = pending.length ? pending.map((i, idx) => `<tr><td>${i.name}</td><td><input type="checkbox" data-pending="${idx}" /></td></tr>`).join('') : '<tr><td colspan="2">Sin pendientes.</td></tr>';
  if (deliveredOrderItemsTable) deliveredOrderItemsTable.innerHTML = done.length ? done.map((i) => `<tr><td>${i.name}</td><td>${i.deliveredBy || '-'}</td></tr>`).join('') : '<tr><td colspan="2">Sin entregados.</td></tr>';
}

function applySettings() {
  businessName && (businessName.textContent = state.settings.title1 || 'Mi Cafetería');
  homeSubtitle && (homeSubtitle.textContent = state.settings.title2 || 'Pantalla principal');
  posTitle && (posTitle.textContent = `Ventas - ${state.settings.title1 || 'Mi Cafetería'}`);
  posSubtitle && (posSubtitle.textContent = state.settings.posSubtitle || 'Ventas, productos, deudas, cierres y resumen diario.');
  const root = document.documentElement;
  if (state.settings.accentColor) root.style.setProperty('--accent', state.settings.accentColor);
  if (state.settings.bgColor) root.style.setProperty('--bg', state.settings.bgColor);
  if (state.settings.cardColor) root.style.setProperty('--card', state.settings.cardColor);
  if (businessName) {
    businessName.style.fontSize = `${Number(state.settings.title1Size || 32)}px`;
    businessName.style.fontFamily = state.settings.title1Font || 'Inter, system-ui, sans-serif';
  }
  if (homeSubtitle) {
    homeSubtitle.style.fontSize = `${Number(state.settings.title2Size || 16)}px`;
    homeSubtitle.style.fontFamily = state.settings.title2Font || 'Inter, system-ui, sans-serif';
  }
  if (businessName) businessName.style.color = state.settings.title1Color || '#1d2530';
  if (homeSubtitle) homeSubtitle.style.color = state.settings.title2Color || '#6f7a86';
  if (homeLogo && state.settings.logoSize) homeLogo.style.width = `${Number(state.settings.logoSize || 120)}px`;
  if (posHeaderLogo) posHeaderLogo.style.width = `${Number(state.settings.posLogoSize || 56)}px`;
  if (title1Input) title1Input.value = state.settings.title1 || '';
  if (title2Input) title2Input.value = state.settings.title2 || '';
  if (posTitleInput) posTitleInput.value = state.settings.posTitle || '';
  if (posSubtitleInput) posSubtitleInput.value = state.settings.posSubtitle || '';
  if (logoSizeInput) logoSizeInput.value = String(Number(state.settings.logoSize || 120));
  if (posLogoSizeInput) posLogoSizeInput.value = String(Number(state.settings.posLogoSize || 56));
  if (title1SizeInput) title1SizeInput.value = String(Number(state.settings.title1Size || 32));
  if (title2SizeInput) title2SizeInput.value = String(Number(state.settings.title2Size || 16));
  if (title1FontInput) title1FontInput.value = state.settings.title1Font || 'Inter, system-ui, sans-serif';
  if (title2FontInput) title2FontInput.value = state.settings.title2Font || 'Inter, system-ui, sans-serif';
  if (title1ColorInput) title1ColorInput.value = state.settings.title1Color || '#1d2530';
  if (title2ColorInput) title2ColorInput.value = state.settings.title2Color || '#6f7a86';
  if (accentColorInput) accentColorInput.value = state.settings.accentColor || '#1f7a5c';
  if (bgColorInput) bgColorInput.value = state.settings.bgColor || '#f7f7fb';
  if (cardColorInput) cardColorInput.value = state.settings.cardColor || '#ffffff';
  syncAppConfig();
  syncTempConfigFromApp();
  if (stockMinInput) stockMinInput.value = String(Number(appConfig.stockMinimo || 0));
  if (salesConfigStatus) salesConfigStatus.textContent = `Stock: ${appConfig.stockActivo ? 'ACTIVO' : 'INACTIVO'} · Pedidos: ${appConfig.activarPedidos ? 'ACTIVO' : 'INACTIVO'}`;
  const billing = normalizeBillingSettings();
  if (billingEnabledInput) billingEnabledInput.checked = Boolean(billing.enabled);
  if (billingTitleInput) billingTitleInput.value = billing.title || '';
  if (billingCurrencyInput) billingCurrencyInput.value = billing.currencySymbol || 'Bs';
  if (billingPaperWidthInput) billingPaperWidthInput.value = String(Number(billing.paperWidthMm || 80));
  if (billingMarginInput) billingMarginInput.value = String(Number(billing.marginMm || 4));
  if (billingMessage1Input) billingMessage1Input.value = billing.message1 || '';
  if (billingMessage2Input) billingMessage2Input.value = billing.message2 || '';
  if (billingLogoSizeInput) billingLogoSizeInput.value = String(Number(billing.logoSizeMm || 28));
  if (billingTitleSizeInput) billingTitleSizeInput.value = String(Number(billing.titleSizePt || 12));
  if (billingTitleBoldInput) billingTitleBoldInput.checked = Boolean(billing.titleBold);
  if (billingTitleFontInput) billingTitleFontInput.value = billing.titleFont || 'helvetica';
  if (billingLogoTitleGapInput) billingLogoTitleGapInput.value = String(Number(billing.logoTitleGapMm || 8));
  if (billingMessage1SizeInput) billingMessage1SizeInput.value = String(Number(billing.message1SizePt || 9));
  if (billingMessage1BoldInput) billingMessage1BoldInput.checked = Boolean(billing.message1Bold);
  if (billingMessage1FontInput) billingMessage1FontInput.value = billing.message1Font || 'helvetica';
  if (billingMessage2SizeInput) billingMessage2SizeInput.value = String(Number(billing.message2SizePt || 9));
  if (billingMessage2BoldInput) billingMessage2BoldInput.checked = Boolean(billing.message2Bold);
  if (billingMessage2FontInput) billingMessage2FontInput.value = billing.message2Font || 'helvetica';
  if (billingModeIndicator) billingModeIndicator.textContent = `Estado actual: ${billing.enabled ? 'ACTIVADO' : 'DESACTIVADO'}`;
  if (billingToggleActionBtn) billingToggleActionBtn.textContent = billing.enabled ? 'Desactivar' : 'Activar';
  if (billingAutoPrintInput) billingAutoPrintInput.checked = Boolean(billing.autoPrintEnabled);
  if (billingAutoPrintIndicator) billingAutoPrintIndicator.textContent = `Estado actual: ${billing.autoPrintEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`;
  if (billingAutoPrintToggleActionBtn) billingAutoPrintToggleActionBtn.textContent = billing.autoPrintEnabled ? 'Desactivar' : 'Activar';
  if (billingLogoCurrentPreview && billingLogoCurrentText) {
    if (billing.logoDataUrl) {
      billingLogoCurrentPreview.src = billing.logoDataUrl;
      billingLogoCurrentPreview.classList.remove('hidden');
      billingLogoCurrentText.textContent = 'Logo actual: Configurado';
    } else {
      billingLogoCurrentPreview.src = '';
      billingLogoCurrentPreview.classList.add('hidden');
      billingLogoCurrentText.textContent = 'Logo actual: No configurado';
    }
  }
  renderBillingPreview();
  if (state.settings.logoDataUrl && homeLogo && logoPlaceholder) {
    console.info('[settings][logo-apply]', { target: 'home', hasLogo: true });
    homeLogo.src = state.settings.logoDataUrl;
    homeLogo.classList.remove('hidden');
    logoPlaceholder.classList.add('hidden');
  }
  if (state.settings.logoDataUrl && posHeaderLogo) {
    console.info('[settings][logo-apply]', { target: 'pos', hasLogo: true });
    posHeaderLogo.src = state.settings.logoDataUrl;
    posHeaderLogo.classList.remove('hidden');
  }
  console.info('[settings][logo-render]', { hasLogo: Boolean(state.settings.logoDataUrl), homeHidden: homeLogo?.classList.contains('hidden'), posHidden: posHeaderLogo?.classList.contains('hidden') });
}

function renderCashStatus() {
  if (!cashStatus) return;
  const activeCash = getActiveCashBox();
  if (!activeCash) {
    cashStatus.textContent = 'Caja cerrada. No hay caja activa.';
    return;
  }
  cashStatus.textContent = `Caja ABIERTA desde ${new Date(activeCash.fecha_apertura).toLocaleString()} por ${activeCash.usuario_apertura}. Monto inicial: ${money(activeCash.openingCash || 0)}.`;
}

function formatDurationMs(ms) {
  const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
}

function getClosingAggregates(closing) {
  const sales = Array.isArray(closing?.salesSnapshot) ? closing.salesSnapshot : [];
  const productsMap = new Map();
  let qtyTotal = 0;
  let saleMax = 0;
  let saleMin = sales.length ? Number(sales[0].total || 0) : 0;
  sales.forEach((sale) => {
    const total = Number(sale.total || 0);
    saleMax = Math.max(saleMax, total);
    saleMin = Math.min(saleMin, total);
    (sale.items || []).forEach((it) => {
      const name = it.name || 'Producto';
      if (!productsMap.has(name)) productsMap.set(name, { qty: 0, total: 0 });
      const row = productsMap.get(name);
      row.qty += Number(it.qty || 0);
      row.total += Number((it.finalSubtotal ?? (it.price * it.qty)) || 0);
      qtyTotal += Number(it.qty || 0);
    });
  });
  const products = [...productsMap.entries()].map(([name, row]) => ({ name, ...row })).sort((a,b)=>b.qty-a.qty);
  const topByQty = products[0] || null;
  const topByAmount = products.slice().sort((a,b)=>b.total-a.total)[0] || null;
  const net = Number(closing.cashIn || 0) + Number(closing.qrIn || 0);
  const opening = Number(closing.openingCash || 0);
  const outflows = Array.isArray(closing.outflowsSnapshot) ? closing.outflowsSnapshot : [];
  const outTotal = outflows.filter((m)=>m.direction==='salida').reduce((a,m)=>a+Number(m.amount||0),0);
  const inTotal = outflows.filter((m)=>m.direction==='entrada').reduce((a,m)=>a+Number(m.amount||0),0);
  const expected = opening + Number(closing.cashIn || 0) + inTotal - outflows.filter((m)=>m.direction==='salida' && m.method==='efectivo').reduce((a,m)=>a+Number(m.amount||0),0);
  const counted = Number(closing.finalCashInBox || 0);
  const diff = counted - expected;
  return {
    sales,
    products,
    qtyTotal,
    saleMax,
    saleMin: sales.length ? saleMin : 0,
    avgTicket: sales.length ? net / sales.length : 0,
    topByQty,
    topByAmount,
    productsDistinct: products.length,
    net,
    opening,
    outTotal,
    inTotal,
    expected,
    counted,
    diff,
    cash: Number(closing.cashIn || 0),
    qr: Number(closing.qrIn || 0),
    transfer: Number(closing.transferIn || 0),
    others: Math.max(0, net - Number(closing.cashIn || 0) - Number(closing.qrIn || 0) - Number(closing.transferIn || 0))
  };
}

async function ensureJsPdfLibs() {
  if (window.jspdf?.jsPDF) return;
  const load = (src) => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = reject;
    document.head.appendChild(el);
  });
  await load('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
  await load('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js');
}

async function downloadClosingPdf(closingId) {
  const closing = state.cashClosings.find((c) => c.id === closingId);
  if (!closing) return;
  try {
    await ensureJsPdfLibs();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const agg = getClosingAggregates(closing);
    const y0 = 12;
    doc.setFontSize(14);
    doc.text((state.settings?.title1 || 'Mi Cafetería'), 14, y0);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, y0 + 6);
    doc.setFontSize(13);
    doc.text('REPORTE DE CIERRE DE CAJA', 105, y0 + 14, { align: 'center' });
    doc.setFontSize(10);
    const general = [
      ['Número de cierre', String(closing.id || '-').slice(-8)],
      ['Fecha apertura', new Date(closing.openedAt || closing.fecha_apertura || closing.closedAt).toLocaleDateString()],
      ['Hora apertura', new Date(closing.openedAt || closing.fecha_apertura || closing.closedAt).toLocaleTimeString()],
      ['Fecha cierre', new Date(closing.closedAt).toLocaleDateString()],
      ['Hora cierre', new Date(closing.closedAt).toLocaleTimeString()],
      ['Usuario apertura', closing.usuario_apertura || state.cashBoxes.find((b) => b.id === closing.cashBoxId)?.usuario_apertura || '-'],
      ['Usuario cierre', closing.usuario_cierre || state.cashBoxes.find((b) => b.id === closing.cashBoxId)?.usuario_cierre || '-'],
      ['Tiempo abierto', formatDurationMs(new Date(closing.closedAt) - new Date(closing.openedAt || closing.fecha_apertura || closing.closedAt))]
    ];
    doc.autoTable({ startY: y0 + 18, head: [['Información general', 'Valor']], body: general, theme: 'grid' });
    const fy = doc.lastAutoTable.finalY + 4;
    const fin = [
      ['Monto inicial', money(agg.opening)],
      ['Total ventas brutas', money(agg.net)],
      ['Total descuentos', money(Number(closing.discountTotal || 0))],
      ['Total ingresos netos', money(agg.net)],
      ['Total efectivo', money(agg.cash)],
      ['Total QR', money(agg.qr)],
      ['Total salidas', money(agg.outTotal)],
      ['Total entradas', money(agg.inTotal)],
      ['Total esperado', money(agg.expected)],
      ['Total contado', money(agg.counted)]
    ];
    doc.autoTable({ startY: fy, head: [['Resumen financiero', 'Valor']], body: fin, theme: 'grid' });
    const oy = doc.lastAutoTable.finalY + 4;
    const ops = [
      ['Cantidad total de ventas', String(closing.salesCount || agg.sales.length)],
      ['Total productos vendidos', String(agg.qtyTotal)],
      ['Ticket promedio', money(agg.avgTicket)],
      ['Venta más alta', money(agg.saleMax)],
      ['Venta más baja', money(agg.saleMin)]
    ];
    doc.autoTable({ startY: oy, head: [['Métricas operativas', 'Valor']], body: ops, theme: 'grid' });
    doc.addPage();
    doc.autoTable({ startY: 12, head: [['Producto', 'Cantidad', 'Total generado']], body: agg.products.map((p)=>[p.name, String(p.qty), money(p.total)]), theme: 'grid' });
    const py = doc.lastAutoTable.finalY + 4;
    const totalNet = Math.max(1, agg.net);
    const mpay = [
      ['Efectivo', `${money(agg.cash)} (${((agg.cash/totalNet)*100).toFixed(1)}%)`],
      ['Transferencia', `${money(agg.transfer)} (${((agg.transfer/totalNet)*100).toFixed(1)}%)`],
      ['QR', `${money(agg.qr)} (${((agg.qr/totalNet)*100).toFixed(1)}%)`],
      ['Otros', `${money(agg.others)} (${((agg.others/totalNet)*100).toFixed(1)}%)`]
    ];
    doc.autoTable({ startY: py, head: [['Método', 'Monto']], body: mpay, theme: 'grid' });
    const movementRows = (closing.outflowsSnapshot || []).map((m) => [
      new Date(m.createdAt || closing.closedAt).toLocaleString(),
      m.direction || '-',
      m.method || '-',
      m.description || '-',
      money(m.amount || 0),
      m.user || '-'
    ]);
    const entriesRows = movementRows.filter((r) => String(r[1]).toLowerCase() === 'entrada');
    const exitsRows = movementRows.filter((r) => String(r[1]).toLowerCase() === 'salida');

    const userSalesMap = new Map();
    (closing.salesSnapshot || []).forEach((sale) => {
      const user = sale.user || '-';
      if (!userSalesMap.has(user)) userSalesMap.set(user, { count: 0, total: 0 });
      const row = userSalesMap.get(user);
      row.count += 1;
      row.total += Number(sale.total || 0);
    });
    const userSalesRows = [...userSalesMap.entries()].map(([user, row]) => [user, String(row.count), money(row.total)]);

    doc.autoTable({ startY: doc.lastAutoTable.finalY + 4, head: [['DETALLE DE ENTRADAS', '', '', '', '', '']], body: entriesRows.length ? entriesRows : [['Sin entradas.', '', '', '', '', '']], theme: 'grid' });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 3, head: [['DETALLE DE SALIDAS', '', '', '', '', '']], body: exitsRows.length ? exitsRows : [['Sin salidas.', '', '', '', '', '']], theme: 'grid' });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 3, head: [['VENTAS POR USUARIO', '', '']], body: userSalesRows.length ? userSalesRows : [['Sin ventas por usuario.', '', '']], theme: 'grid' });
    const historyRows = closingSalesHistoryRows(closing).map((sale) => [
      new Date(sale.createdAt || sale.deletedAt).toLocaleString(),
      `#${orderNumberLabel(sale.orderNumber)}`,
      sale.payment || '-',
      money(sale.total),
      sale.user || '-',
      sale.statusLabel || sale.status || 'OK'
    ]);
    doc.addPage();
    doc.autoTable({ startY: 12, head: [['HISTORIAL DE VENTAS DE CIERRE', '', '', '', '', '']], body: historyRows.length ? historyRows : [['Sin historial de ventas.', '', '', '', '', '']], theme: 'grid', didParseCell: (hook) => {
      if (hook.section !== 'body') return;
      const cellText = String(hook.row?.raw?.[5] || '');
      if (cellText.includes('ANULADA')) {
        hook.cell.styles.textColor = [193, 18, 31];
        hook.cell.styles.fontStyle = 'bold';
      }
    } });
    doc.save(`cierre_${String(closing.id || '').slice(-8)}.pdf`);
  } catch (err) {
    console.error('[pdf] cierre', err);
    alert('No se pudo generar el PDF del cierre.');
  }
}

function ensureClosingsStatsUI() {
  const panel = document.getElementById('cierres');
  if (!panel || document.getElementById('closingsStatsCard')) return;
  const card = document.createElement('div');
  card.id = 'closingsStatsCard';
  card.className = 'card';
  card.innerHTML = `<div class="grid3"><button id="selectClosingsBtn" class="secondary" type="button">Seleccionar cierres</button><button id="generateClosingsStatsBtn" class="primary" type="button" disabled>Generar estadísticas</button><button id="downloadClosingsStatsPdfBtn" class="secondary" type="button" disabled>Descargar PDF</button>${isAdminUser() ? '<button id="modifyOpeningCashBtn" class="secondary" type="button">Modificar inicio de caja</button>' : ''}</div><p id="selectedClosingsInfo" class="muted">Cantidad de cierres seleccionados: 0</p><div id="closingsStatsOutput"></div>`;
  panel.insertBefore(card, panel.children[1] || null);
}

function activeClosingsList() {
  return (state.cashClosings || []).slice().sort((a,b)=>new Date(b.closedAt)-new Date(a.closedAt));
}

function openSelectClosingsModal() {
  document.getElementById('selectClosingsOverlay')?.remove();
  const list = activeClosingsList();
  const ov = document.createElement('div');
  ov.id = 'selectClosingsOverlay';
  ov.className = 'modal';
  ov.innerHTML = `<div class="modal-card"><h3>LISTADO DE CIERRES ACTIVOS</h3><div class="grid2"><button id="selectAllClosingsBtn" class="secondary" type="button">Seleccionar todo</button><button id="acceptClosingsSelectionBtn" class="primary" type="button">Aceptar</button></div><table><thead><tr><th></th><th>Nro cierre</th><th>Fecha apertura</th><th>Fecha cierre</th><th>Usuario</th><th>Total generado</th></tr></thead><tbody id="selectClosingsTable"></tbody></table><button id="closeSelectClosingsBtn" class="secondary" type="button">Cerrar</button></div>`;
  document.body.appendChild(ov);
  const tbody = ov.querySelector('#selectClosingsTable');
  tbody.innerHTML = list.map((c)=>`<tr><td><input type="checkbox" data-sc-id="${c.id}" ${state.selectedClosingIds.includes(c.id)?'checked':''} /></td><td>${String(c.id||'-').slice(-8)}</td><td>${new Date(c.openedAt || c.closedAt).toLocaleString()}</td><td>${new Date(c.closedAt).toLocaleString()}</td><td>${c.usuario_cierre || c.usuario_apertura || '-'}</td><td>${money(Number(c.cashIn||0)+Number(c.qrIn||0))}</td></tr>`).join('');
  ov.querySelector('#closeSelectClosingsBtn').onclick = () => ov.remove();
  ov.querySelector('#selectAllClosingsBtn').onclick = () => {
    ov.querySelectorAll('input[data-sc-id]').forEach((ch)=>{ ch.checked = true; });
  };
  ov.querySelector('#acceptClosingsSelectionBtn').onclick = () => {
    const ids = [...ov.querySelectorAll('input[data-sc-id]:checked')].map((ch)=>ch.dataset.scId);
    if (!ids.length) return alert('Debe seleccionar al menos un cierre');
    state.selectedClosingIds = ids;
    const info = document.getElementById('selectedClosingsInfo');
    if (info) info.textContent = `Cantidad de cierres seleccionados: ${ids.length}`;
    const genBtn = document.getElementById('generateClosingsStatsBtn');
    if (genBtn) genBtn.disabled = false;
    ov.remove();
  };
}



function openModifyOpeningCashModal() {
  if (!isAdminUser()) return;
  const active = getActiveCashBox();
  if (!active) return alert('No hay caja activa para modificar inicio de caja.');
  document.getElementById('modifyOpeningOverlay')?.remove();
  const ov = document.createElement('div');
  ov.id = 'modifyOpeningOverlay';
  ov.className = 'modal';
  ov.innerHTML = `<div class="modal-card"><h3>Modificar inicio de caja actual</h3><p>Caja activa: ${String(active.id || '').slice(-8)}</p><p id="currentOpeningText">Inicio actual: ${money(Number(active.openingCash || 0))}</p><label>Nuevo monto<input id="newOpeningCashInput" type="number" min="0" step="0.01" value="${Number(active.openingCash || 0)}" /></label><label>Contraseña admin<input id="modifyOpeningPassInput" type="password" placeholder="Contraseña admin" /></label><div class="grid2"><button id="confirmModifyOpeningBtn" class="primary" type="button">Añadir cambio</button><button id="cancelModifyOpeningBtn" class="secondary" type="button">Cancelar</button></div><p id="modifyOpeningMsg"></p></div>`;
  document.body.appendChild(ov);
  document.getElementById('cancelModifyOpeningBtn')?.addEventListener('click', () => ov.remove());
  document.getElementById('confirmModifyOpeningBtn')?.addEventListener('click', () => {
    const admin = currentUserRecord();
    const pass = String(document.getElementById('modifyOpeningPassInput')?.value || '');
    const val = Math.max(0, Number(document.getElementById('newOpeningCashInput')?.value || 0));
    if (!admin || admin.username !== 'admin' || pass !== String(admin.password || '')) {
      const m = document.getElementById('modifyOpeningMsg');
      if (m) { m.textContent = 'Contraseña admin incorrecta.'; m.className = 'error'; }
      return;
    }
    active.openingCash = val;
    if (state.cashSession && state.cashSession.id === active.id) state.cashSession.openingCash = val;
    persist();
    renderCashStatus();
    renderSummary();
    renderHomeActions();
    ov.remove();
    alert('Inicio de caja actual actualizado correctamente.');
  });
}


function buildStatsFromSelectedClosings() {
  const selected = activeClosingsList().filter((c)=>state.selectedClosingIds.includes(c.id));
  const stats = {
    selected,
    count: selected.length,
    salesCount: 0,
    totalIncome: 0,
    cash: 0,
    transfer: 0,
    qr: 0,
    others: 0,
    expenses: 0,
    productsTotalQty: 0,
    productsMap: new Map(),
    usersMap: new Map()
  };
  selected.forEach((c) => {
    const agg = getClosingAggregates(c);
    stats.salesCount += Number(c.salesCount || agg.sales.length || 0);
    stats.totalIncome += agg.net;
    stats.cash += agg.cash;
    stats.transfer += agg.transfer;
    stats.qr += agg.qr;
    stats.others += agg.others;
    stats.expenses += agg.outTotal;
    stats.productsTotalQty += agg.qtyTotal;
    agg.products.forEach((p) => {
      if (!stats.productsMap.has(p.name)) stats.productsMap.set(p.name, { qty: 0, total: 0 });
      const row = stats.productsMap.get(p.name);
      row.qty += p.qty;
      row.total += p.total;
    });
    const user = c.usuario_cierre || c.usuario_apertura || '-';
    if (!stats.usersMap.has(user)) stats.usersMap.set(user, { closings: 0, total: 0 });
    const ur = stats.usersMap.get(user);
    ur.closings += 1;
    ur.total += agg.net;
  });
  stats.avgTicket = stats.salesCount ? stats.totalIncome / stats.salesCount : 0;
  stats.products = [...stats.productsMap.entries()].map(([name,row])=>({name,...row}));
  stats.productsTopQty = stats.products.slice().sort((a,b)=>b.qty-a.qty)[0] || null;
  stats.productsTopAmount = stats.products.slice().sort((a,b)=>b.total-a.total)[0] || null;
  stats.top5 = stats.products.slice().sort((a,b)=>b.qty-a.qty).slice(0,5);
  stats.users = [...stats.usersMap.entries()].map(([user,row])=>({user,...row}));
  const payTotal = Math.max(1, stats.totalIncome);
  stats.paymentPct = {
    cash: (stats.cash / payTotal) * 100,
    transfer: (stats.transfer / payTotal) * 100,
    qr: (stats.qr / payTotal) * 100,
    others: (stats.others / payTotal) * 100
  };
  stats.mostUsedMethod = Object.entries({Efectivo:stats.cash,Transferencia:stats.transfer,QR:stats.qr,Otros:stats.others}).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
  return stats;
}

function renderClosingsStatsOutput(stats) {
  const out = document.getElementById('closingsStatsOutput');
  if (!out) return;
  out.innerHTML = `<div class="card"><h4>Resumen general</h4><p>Total ventas: ${stats.salesCount}</p><p>Total ingresos: ${money(stats.totalIncome)}</p><p>Total efectivo: ${money(stats.cash)}</p><p>Total transferencias: ${money(stats.transfer)}</p><p>Total QR: ${money(stats.qr)}</p><p>Total gastos: ${money(stats.expenses)}</p><p>Ticket promedio global: ${money(stats.avgTicket)}</p><p>Total productos vendidos: ${stats.productsTotalQty}</p><p>Cierres seleccionados: ${stats.count}</p></div><div class="card"><h4>Productos</h4><p>Producto más vendido: ${stats.productsTopQty ? `${stats.productsTopQty.name} (${stats.productsTopQty.qty})` : '-'}</p><p>Producto que más dinero generó: ${stats.productsTopAmount ? `${stats.productsTopAmount.name} (${money(stats.productsTopAmount.total)})` : '-'}</p><p>Total productos distintos vendidos: ${stats.products.length}</p><table><thead><tr><th>Top 5 productos</th><th>Cantidad</th><th>Total</th></tr></thead><tbody>${stats.top5.map((p)=>`<tr><td>${p.name}</td><td>${p.qty}</td><td>${money(p.total)}</td></tr>`).join('') || '<tr><td colspan="3">Sin datos</td></tr>'}</tbody></table></div><div class="card"><h4>Métodos de pago</h4><p>Efectivo: ${money(stats.cash)} (${stats.paymentPct.cash.toFixed(1)}%)</p><p>Transferencia: ${money(stats.transfer)} (${stats.paymentPct.transfer.toFixed(1)}%)</p><p>QR: ${money(stats.qr)} (${stats.paymentPct.qr.toFixed(1)}%)</p><p>Otros: ${money(stats.others)} (${stats.paymentPct.others.toFixed(1)}%)</p><p>Método más utilizado: ${stats.mostUsedMethod}</p></div><div class="card"><h4>Usuarios</h4><table><thead><tr><th>Usuario</th><th>Cierres</th><th>Total generado</th></tr></thead><tbody>${stats.users.map((u)=>`<tr><td>${u.user}</td><td>${u.closings}</td><td>${money(u.total)}</td></tr>`).join('') || '<tr><td colspan="3">Sin datos</td></tr>'}</tbody></table></div><div class="card"><h4>Estadísticas gráficas comparativas</h4><canvas id="closingsIncomeChart" width="760" height="220"></canvas><canvas id="closingsProductsChart" width="760" height="220"></canvas></div>`;
  const drawBars = (canvasId, labels, values, color='#1f7a5c') => {
    const cv = document.getElementById(canvasId);
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const w = cv.width;
    const h = cv.height;
    ctx.clearRect(0, 0, w, h);
    if (!values.length) return;
    const max = Math.max(...values, 1);
    const bw = Math.max(20, Math.floor((w - 40) / values.length) - 8);
    values.forEach((v, i) => {
      const x = 24 + i * (bw + 8);
      const bh = Math.max(2, Math.round((v / max) * (h - 55)));
      const y = h - 30 - bh;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = '#344054';
      ctx.font = '11px sans-serif';
      ctx.fillText(String(labels[i] || ''), x, h - 12);
    });
  };
  const closings = (stats.selected || []).slice().sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt));
  drawBars('closingsIncomeChart', closings.map((c, i) => `C${i + 1}`), closings.map((c) => Number(c.cashIn || 0) + Number(c.qrIn || 0)), '#1570ef');
  drawBars('closingsProductsChart', (stats.top5 || []).map((p) => p.name), (stats.top5 || []).map((p) => Number(p.qty || 0)), '#1f7a5c');
}

async function downloadClosingsStatsPdf() {
  if (!state.generatedClosingsStats) return;
  try {
    await ensureJsPdfLibs();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const st = state.generatedClosingsStats;
    doc.setFontSize(14);
    doc.text((state.settings?.title1 || 'Mi Cafetería'), 14, 12);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 18);
    doc.setFontSize(13);
    doc.text('REPORTE DE ESTADÍSTICAS DE CIERRES SELECCIONADOS', 105, 26, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Cantidad de cierres seleccionados: ${st.count}`, 14, 34);
    doc.autoTable({ startY: 38, head: [['Resumen general', 'Valor']], body: [
      ['Total ventas', String(st.salesCount)], ['Total ingresos', money(st.totalIncome)], ['Total efectivo', money(st.cash)], ['Total QR', money(st.qr)], ['Total gastos', money(st.expenses)], ['Ticket promedio global', money(st.avgTicket)], ['Total productos vendidos', String(st.productsTotalQty)]
    ] });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 4, head: [['Producto', 'Cantidad', 'Total']], body: st.top5.map((p)=>[p.name,String(p.qty),money(p.total)]) });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 4, head: [['Método de pago', 'Monto']], body: [
      ['Efectivo', `${money(st.cash)} (${st.paymentPct.cash.toFixed(1)}%)`],
      ['QR', `${money(st.qr)} (${st.paymentPct.qr.toFixed(1)}%)`],
      ['Otros', `${money(st.others)} (${st.paymentPct.others.toFixed(1)}%)`]
    ]});
    doc.addPage();
    doc.autoTable({ startY: 12, head: [['Usuario', 'Cierres', 'Total generado']], body: st.users.map((u)=>[u.user,String(u.closings),money(u.total)]) });
    doc.save('estadisticas_cierres_seleccionados.pdf');
  } catch (error) {
    console.error('[pdf] stats', error);
    alert('No se pudo generar el PDF de estadísticas.');
  }
}
function renderCashClosings() {
  if (!cashClosingsTable) return;
  ensureClosingsStatsUI();
  const month = closingsMonthFilter?.value || '';
  const list = month ? state.cashClosings.filter((c) => c.closedAt?.slice(0, 7) === month) : state.cashClosings;
  cashClosingsTable.innerHTML = '';
  if (!list.length) {
    cashClosingsTable.innerHTML = '<tr><td colspan="14">No hay cierres para el filtro seleccionado.</td></tr>';
    return;
  }
  list.forEach((c, idx) => {
    const outCash = (c.outflowsSnapshot || []).filter((m) => m.direction === 'salida' && m.method === 'efectivo').reduce((a,m)=>a+Number(m.amount||0),0);
    const inCash = (c.outflowsSnapshot || []).filter((m) => m.direction === 'entrada' && m.method === 'efectivo').reduce((a,m)=>a+Number(m.amount||0),0);
    const outQr = (c.outflowsSnapshot || []).filter((m) => m.direction === 'salida' && m.method === 'qr').reduce((a,m)=>a+Number(m.amount||0),0);
    const inQr = (c.outflowsSnapshot || []).filter((m) => m.direction === 'entrada' && m.method === 'qr').reduce((a,m)=>a+Number(m.amount||0),0);
    const finalCash = Number(c.openingCash || 0) + Number(c.cashIn || 0) - outCash + inCash;
    const finalQr = Number(c.qrIn || 0) - outQr + inQr;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(c.closedAt).toLocaleString()}</td><td>${money(c.openingCash)}</td><td>${money(c.cashIn)}</td><td>${money(c.qrIn)}</td><td>${money(c.debtPending || 0)}</td><td>${money(outCash)}</td><td>${money(inCash)}</td><td>${money(outQr)}</td><td>${money(inQr)}</td><td>${money(finalCash)}</td><td>${money(finalQr)}</td><td>${c.salesCount || 0}</td><td><button class="secondary" data-closing-id="${c.id}" type="button">Ver detalle</button> <button class="secondary" data-closing-pdf="${c.id}" type="button">PDF</button></td><td>${hasPermission('deleteClosings') ? `<button class="secondary" data-closing-del="${c.id}" type="button">Eliminar</button>` : '-'}</td>`;
    tr.dataset.closingNumber = String(idx + 1);
    cashClosingsTable.appendChild(tr);
  });
}

function renderClosingDetails(closingId) {
  const closing = state.cashClosings.find((c) => c.id === closingId);
  if (!closing || !closingDetailsCard) return;
  activeClosingDetailId = closing.id;
  closingDetailsCard.classList.remove('hidden');
  if (closingDetailsTitle) closingDetailsTitle.textContent = `Detalle de cierre #${String(closing.id || '').slice(-8)}`;
  const deletedCount = Array.isArray(closing.deletedSalesSnapshot) ? closing.deletedSalesSnapshot.length : 0;
  const outflowCount = Array.isArray(closing.outflowsSnapshot) ? closing.outflowsSnapshot.length : 0;
  const debtPaymentsCount = Array.isArray(closing.debtPaymentsSnapshot) ? closing.debtPaymentsSnapshot.length : 0;
  const outCash = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'salida' && m.method === 'efectivo').reduce((a,m)=>a+Number(m.amount||0),0);
  const inCash = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'entrada' && m.method === 'efectivo').reduce((a,m)=>a+Number(m.amount||0),0);
  const outQr = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'salida' && m.method === 'qr').reduce((a,m)=>a+Number(m.amount||0),0);
  const inQr = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'entrada' && m.method === 'qr').reduce((a,m)=>a+Number(m.amount||0),0);
  const agg = getClosingAggregates(closing);
  const sales = Array.isArray(closing.salesSnapshot) ? closing.salesSnapshot : state.sales.filter((sale) => (closing.salesIds || []).includes(sale.id));
  const openAt = new Date(closing.openedAt || closing.fecha_apertura || closing.closedAt);
  const closeAt = new Date(closing.closedAt);
  const grossSales = sales.reduce((sum, sale) => sum + (sale.items || []).reduce((a, it) => a + Number(it.price || 0) * Number(it.qty || 0), 0), 0);
  const totalDiscounts = sales.reduce((sum, sale) => sum + (sale.items || []).reduce((a, it) => {
    const gross = Number(it.price || 0) * Number(it.qty || 0);
    const final = Number(it.finalSubtotal ?? gross);
    return a + Math.max(0, gross - final);
  }, 0), 0);
  const debtPayments = Array.isArray(closing.debtPaymentsSnapshot) ? closing.debtPaymentsSnapshot.filter((p) => !p?.anulado) : [];
  const debtCash = debtPayments.reduce((a, p) => a + Number(p.cashAmount || (p.method === 'efectivo' ? p.amount : 0) || 0), 0);
  const debtQr = debtPayments.reduce((a, p) => a + Number(p.qrAmount || (p.method === 'qr' ? p.amount : 0) || 0), 0);
  const totalCash = Number(closing.cashIn || 0) + debtCash;
  const totalQr = Number(closing.qrIn || 0) + debtQr;
  const openingCash = Number(closing.openingCash || 0);
  const totalCashFinal = totalCash - outCash + inCash;
  const totalQrFinal = totalQr - outQr + inQr;
  const totalInBox = openingCash + totalCashFinal;
  const realDelivered = totalInBox - openingCash;
  const entries = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'entrada');
  const exits = (closing.outflowsSnapshot || []).filter((m) => m.direction === 'salida');
  const closingHistory = closingSalesHistoryRows(closing);
  const closingHistoryRows = closingHistory.length
    ? closingHistory.map((sale) => `<tr style="${sale.status === 'ANULADA' ? 'color:#c1121f;font-weight:700;' : ''}"><td>${new Date(sale.createdAt || sale.deletedAt).toLocaleString()}</td><td>#${orderNumberLabel(sale.orderNumber)}</td><td>${sale.payment || '-'}</td><td>${money(sale.total)}</td><td>${sale.user || '-'}</td><td>${sale.statusLabel || sale.status}</td></tr>`).join('')
    : '<tr><td colspan="6">Sin historial de ventas.</td></tr>';
  if (closingSummaryText) closingSummaryText.innerHTML = `<div class="card"><h4>SECCIÓN 1 – INFORMACIÓN GENERAL</h4><p>Número de cierre: ${String(closing.id || '-').slice(-8)}</p><p>Fecha de apertura: ${openAt.toLocaleDateString()}</p><p>Hora de apertura: ${openAt.toLocaleTimeString()}</p><p>Fecha de cierre: ${closeAt.toLocaleDateString()}</p><p>Hora de cierre: ${closeAt.toLocaleTimeString()}</p><p>Usuario que abrió: ${closing.usuario_apertura || '-'}</p><p>Usuario que cerró: ${closing.usuario_cierre || '-'}</p><p>Tiempo total de caja abierta: ${formatDurationMs(closeAt - openAt)}</p></div><div class="card"><h4>Detalle para enviar</h4><p>Cambio inicial: ${money(openingCash)}</p><p>Valor efectivo de ventas: ${money(totalCash)}</p><p>Valor QR de ventas: ${money(totalQr)}</p><p>Salida efectivo: ${money(outCash)}</p><p>Entrada efectivo: ${money(inCash)}</p><p>Salida QR: ${money(outQr)}</p><p>Entrada QR: ${money(inQr)}</p><p>Valor final en caja: ${money(totalInBox)}</p><p>Valor final descontando cambio inicial: ${money(realDelivered)}</p></div><div class="card"><h4>SECCIÓN 2 – RESUMEN FINANCIERO</h4><p>Inicio de caja: ${money(openingCash)}</p><p>Total ventas brutas: ${money(grossSales)}</p><p>Total descuentos: ${money(totalDiscounts)}</p><p>Total ingresos netos: ${money(grossSales - totalDiscounts)}</p><p>Total en efectivo: ${money(totalCash)}</p><p>Total QR: ${money(totalQr)}</p><p>Total salidas externas efectivo: ${money(outCash)}</p><p>Total salidas externas QR: ${money(outQr)}</p><p>Total entradas externas efectivo: ${money(inCash)}</p><p>Total entradas externas QR: ${money(inQr)}</p><p>Total efectivo final: ${money(totalCashFinal)}</p><p>Total QR final: ${money(totalQrFinal)}</p><p>Valor total en caja (incluye valor de caja): ${money(totalInBox)}</p><p>Valor efectivo real de venta entregado: ${money(realDelivered)}</p></div><div class="card"><h4>Productos vendidos</h4><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead><tbody>${agg.products.length ? agg.products.map((row) => `<tr><td>${row.name}</td><td>${row.qty}</td><td>${money(row.total)}</td></tr>`).join('') : '<tr><td colspan="3">Sin productos vendidos.</td></tr>'}</tbody></table></div><div class="card"><h4>HISTORIAL DE VENTAS DE CIERRE</h4><table><thead><tr><th>Fecha</th><th>Nro pedido</th><th>Método</th><th>Total</th><th>Usuario</th><th>Estado</th></tr></thead><tbody>${closingHistoryRows}</tbody></table></div><div class="card"><h4>SECCIÓN 3 – MÉTRICAS OPERATIVAS</h4><p>Cantidad total de ventas: ${closing.salesCount || sales.length}</p><p>Total productos vendidos: ${agg.qtyTotal}</p><p>Ticket promedio: ${money(agg.avgTicket)}</p><p>Venta más alta: ${money(agg.saleMax)}</p><p>Venta más baja: ${money(agg.saleMin)}</p><p>Ventas eliminadas: ${deletedCount} · Mov. caja: ${outflowCount} · Pagos deuda: ${debtPaymentsCount}</p></div><div class="card"><h4>Detalle de entradas</h4><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Método</th><th>Monto</th><th>Usuario</th></tr></thead><tbody>${entries.map((m) => `<tr><td>${new Date(m.createdAt).toLocaleString()}</td><td>${m.description || '-'}</td><td>${m.method || '-'}</td><td>${money(m.amount || 0)}</td><td>${m.user || '-'}</td></tr>`).join('') || '<tr><td colspan="5">Sin entradas.</td></tr>'}</tbody></table></div><div class="card"><h4>Detalle de salidas</h4><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Método</th><th>Monto</th><th>Usuario</th></tr></thead><tbody>${exits.map((m) => `<tr><td>${new Date(m.createdAt).toLocaleString()}</td><td>${m.description || '-'}</td><td>${m.method || '-'}</td><td>${money(m.amount || 0)}</td><td>${m.user || '-'}</td></tr>`).join('') || '<tr><td colspan="5">Sin salidas.</td></tr>'}</tbody></table></div>`;
  if (closingSalesTable) closingSalesTable.innerHTML = sales.length ? sales.map((sale) => `<tr><td>${new Date(sale.createdAt).toLocaleString()}</td><td>#${orderNumberLabel(sale.orderNumber)}</td><td>${sale.payment}</td><td>${money(sale.total)}</td><td>${sale.user}</td></tr>`).join('') : '<tr><td colspan="5">Sin ventas.</td></tr>';
  if (closingProductsTable) {
    const aggProducts = agg.products;
    closingProductsTable.innerHTML = aggProducts.length ? aggProducts.map((row) => `<tr><td>${row.name}</td><td>${row.qty}</td><td>${money(row.total)}</td></tr>`).join('') : '<tr><td colspan="3">Sin productos vendidos.</td></tr>';
  }
  if (closingUsersTable) {
    const usersMap = new Map();
    sales.forEach((sale) => {
      if (!usersMap.has(sale.user)) usersMap.set(sale.user, { count: 0, total: 0 });
      const row = usersMap.get(sale.user);
      row.count += 1;
      row.total += Number(sale.total || 0);
    });
    closingUsersTable.innerHTML = usersMap.size ? [...usersMap.entries()].map(([user, row]) => `<tr><td>${user}</td><td>${row.count}</td><td>${money(row.total)}</td></tr>`).join('') : '<tr><td colspan="3">Sin ventas por usuario.</td></tr>';
  }
  const closingHistoryTable = ensureClosingSalesHistoryTable();
  if (closingHistoryTable) {
    const tableRows = closingHistory.length
      ? closingHistory.map((sale) => `<tr style="${sale.status === 'ANULADA' ? 'color:#c1121f;font-weight:700;' : ''}"><td>${new Date(sale.createdAt || sale.deletedAt).toLocaleString()}</td><td>#${orderNumberLabel(sale.orderNumber)}</td><td>${sale.payment || '-'}</td><td>${money(sale.total)}</td><td>${sale.user || '-'}</td><td style="${sale.status === 'ANULADA' ? 'color:#c1121f;font-weight:700;' : ''}">${sale.statusLabel || sale.status}</td></tr>`).join('')
      : '<tr><td colspan="6">Sin historial de ventas.</td></tr>';
    closingHistoryTable.innerHTML = tableRows;
  }
}



function personFullName(person) {
  if (!person) return '';
  return `${person.name || ''}${person.lastName ? ` ${person.lastName}` : ''}`.trim();
}

function renderPeopleSelectors() {
  const opts = ['<option value="">Selecciona persona</option>']
    .concat(state.people.map((p) => `<option value="${p.id}">${personFullName(p)}</option>`));
  if (debtorSelect) debtorSelect.innerHTML = opts.join('');
  if (partialPersonSelect) partialPersonSelect.innerHTML = opts.join('');
}

function closePersonModal() {
  document.getElementById('personModalOverlay')?.remove();
}

function openPersonFormModal(person = null) {
  closePersonModal();
  const overlay = document.createElement('div');
  overlay.id = 'personModalOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>${person ? 'Editar persona' : 'Añadir persona'}</h3><div class="grid2"><label>Nombre<input id="pmName" type="text" value="${person?.name || ''}" /></label><label>Apellido<input id="pmLast" type="text" value="${person?.lastName || ''}" /></label><label>Descripción<input id="pmDesc" type="text" value="${person?.description || ''}" /></label><label>Número de teléfono<input id="pmPhone" type="text" value="${person?.phone || ''}" /></label></div><div class="grid2"><button id="pmSave" class="primary" type="button">${person ? 'Actualizar' : 'Añadir'}</button><button id="pmCancel" class="secondary" type="button">Volver atrás</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('pmCancel')?.addEventListener('click', closePersonModal);
  document.getElementById('pmSave')?.addEventListener('click', () => {
    const name = (document.getElementById('pmName')?.value || '').trim();
    if (!name) return;
    const payload = {
      name,
      lastName: (document.getElementById('pmLast')?.value || '').trim(),
      description: (document.getElementById('pmDesc')?.value || '').trim(),
      phone: (document.getElementById('pmPhone')?.value || '').trim()
    };
    if (person) Object.assign(person, payload);
    else state.people.push({ id: uid(), ...payload });
    persist();
    renderPeopleSelectors();
    closePersonModal();
    openPeopleListModal();
  });
}

function openPeopleListModal() {
  closePersonModal();
  const overlay = document.createElement('div');
  overlay.id = 'personModalOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Lista de personas</h3><div class="people-scroll"><table><thead><tr><th>Nombre</th><th>Apellido</th><th>Descripción</th><th>Teléfono</th><th>Acciones</th></tr></thead><tbody id="pmListBody"></tbody></table></div><div class="grid2"><button id="pmAddNew" class="primary" type="button">Añadir persona</button><button id="pmClose" class="secondary" type="button">Volver atrás</button></div></div>`;
  document.body.appendChild(overlay);
  const body = document.getElementById('pmListBody');
  if (body) {
    body.innerHTML = state.people.length ? state.people.map((p) => `<tr><td>${p.name}</td><td>${p.lastName || '-'}</td><td>${p.description || '-'}</td><td>${p.phone || '-'}</td><td><button class="secondary" data-pm-edit="${p.id}" type="button">Editar</button> <button class="secondary" data-pm-del="${p.id}" type="button">Eliminar</button></td></tr>`).join('') : '<tr><td colspan="5">Sin personas registradas.</td></tr>';
  }
  document.getElementById('pmClose')?.addEventListener('click', closePersonModal);
  document.getElementById('pmAddNew')?.addEventListener('click', () => openPersonFormModal());
  body?.addEventListener('click', (e) => {
    const edit = e.target.closest('button[data-pm-edit]');
    if (edit) {
      const person = state.people.find((p) => p.id === edit.dataset.pmEdit);
      if (person) openPersonFormModal(person);
      return;
    }
    const del = e.target.closest('button[data-pm-del]');
    if (!del) return;
    const removedId = String(del.dataset.pmDel || '');
    state.people = state.people.filter((p) => p.id !== removedId);
    state.removedPeopleIds = Array.from(new Set([...(state.removedPeopleIds || []), removedId]));
    persist();
    renderPeopleSelectors();
    renderDebtors();
    openPeopleListModal();
  });
}

function renderDebtors() {
  const debtPeopleTable = $('debtPeopleTable');
  const debtPersonTitle = $('debtPersonTitle');
  let debtPersonTotal = $('debtPersonTotal');
  const debtPersonDetailsTable = $('debtPersonDetailsTable');
  if (!debtPeopleTable || !debtPersonDetailsTable || !debtPersonTitle) return;
  if (!debtPersonTotal) {
    debtPersonTotal = document.createElement('p');
    debtPersonTotal.id = 'debtPersonTotal';
    debtPersonTotal.className = 'ok';
    debtPersonTotal.style.fontWeight = '700';
    debtPersonTotal.style.margin = '0.35rem 0 0.75rem';
    debtPersonTitle.insertAdjacentElement('afterend', debtPersonTotal);
  }
  const grouped = new Map();
  console.info('[debt][render]', { salesCount: state.sales?.length || 0, debtPaymentsCount: state.debtPayments?.length || 0 });
  state.sales.filter((s) => Number(s.debtAmount || 0) > 0 && s.debtorId && s.paymentStatus !== 'realizado').forEach((s) => {
    if (!grouped.has(s.debtorId)) grouped.set(s.debtorId, []);
    grouped.get(s.debtorId).push(s);
  });
  const rows = [...grouped.entries()].map(([personId, sales]) => {
    const person = state.people.find((p) => p.id === personId);
    const total = sales.reduce((a, x) => a + Number(x.debtAmount || 0), 0);
    return `<tr><td>${personFullName(person) || 'Persona eliminada'}</td><td>${money(total)}</td><td>${sales.length}</td><td><button class="secondary" data-debtor-id="${personId}" type="button">Ver detalles</button></td></tr>`;
  });
  debtPeopleTable.innerHTML = rows.length ? rows.join('') : '<tr><td colspan="4">Sin deudas pendientes.</td></tr>';
  if (debtPersonTotal && !state.activeDebtorId) debtPersonTotal.textContent = 'Deuda total: Bs 0.00';
  debtPeopleTable.onclick = (e) => {
    const btn = e.target.closest('button[data-debtor-id]');
    if (!btn) return;
    const person = state.people.find((p) => p.id === btn.dataset.debtorId);
    const sales = state.sales.filter((s) => s.debtorId === btn.dataset.debtorId && Number(s.debtAmount || 0) > 0 && s.paymentStatus !== 'realizado');
    const total = sales.reduce((a, s) => a + Number(s.debtAmount || 0), 0);
    state.activeDebtorId = btn.dataset.debtorId;
    debtPersonTitle.textContent = `${personFullName(person)} · ${person?.description || '-'} · Tel: ${person?.phone || '-'}`;
    debtPersonTotal.textContent = `Deuda total: ${money(total)}`;
    debtPersonDetailsTable.innerHTML = sales.map((s) => `<tr><td>${new Date(s.createdAt).toLocaleString()}</td><td>${s.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</td><td>${money(s.debtAmount)}</td><td>${s.user}</td><td><button class=\"secondary\" data-pay-sale=\"${s.id}\" type=\"button\">Pagar deuda</button></td></tr>`).join('');
  };
}

function renderUsers() {
  if (!usersTable) return;
  document.getElementById('backFromUsersActivityBtn')?.remove();
  const head = usersTable.closest('table')?.querySelector('thead tr');
  if (head) head.innerHTML = '<th>Usuario</th><th>Autoriza</th><th>Abrir caja</th><th>Cerrar caja</th><th>Eliminar ventas</th><th>Config. principal</th><th>Productos</th><th>Eliminar cierres</th><th>Eliminar mov. caja</th><th>Vaciar eliminadas</th><th>Gestionar usuarios</th><th>Acción</th>';
  usersTable.innerHTML = state.users.map((u) => `<tr><td>${u.username}</td><td>${u.permissions?.authorizeCash ? 'Sí' : 'No'}</td><td>${u.permissions?.openCash ? 'Sí' : 'No'}</td><td>${u.permissions?.closeCash ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteSales ? 'Sí' : 'No'}</td><td>${u.permissions?.accessSettings ? 'Sí' : 'No'}</td><td>${u.permissions?.manageProducts ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteClosings ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteCashMovements ? 'Sí' : 'No'}</td><td>${u.permissions?.clearDeletedSalesHistory ? 'Sí' : 'No'}</td><td>${u.permissions?.manageUsers ? 'Sí' : 'No'}</td><td><button class="secondary" data-user-edit="${u.username}" type="button">Editar</button> <button class="secondary" data-user-del="${u.username}" type="button">Eliminar</button> <button class="secondary" data-user-toggle-enabled="${u.username}" type="button">${u.enabled === false ? 'Habilitar' : 'Inhabilitar'}</button></td></tr>`).join('');
  if (userManagerCard && !document.getElementById('openUsersActivityBtn')) {
    const btn = document.createElement('button');
    btn.id = 'openUsersActivityBtn';
    btn.className = 'secondary';
    btn.type = 'button';
    btn.textContent = 'Actividad de Usuarios';
    btn.style.marginLeft = '0.5rem';
    userManagerCard.querySelector('.app-toolbar')?.appendChild(btn);
    btn.addEventListener('click', () => navigateTo('settings/users/activity'));
  }
  if (userManagerCard && !document.getElementById('saveUsersChangesBtn')) {
    const btn = document.createElement('button');
    btn.id = 'saveUsersChangesBtn';
    btn.className = 'primary';
    btn.type = 'button';
    btn.textContent = 'Guardar cambios';
    btn.style.marginTop = '0.5rem';
    userManagerCard.appendChild(btn);
  }
  if (userManagerCard && !document.getElementById('usersImportFileInput')) {
    const input = document.createElement('input');
    input.id = 'usersImportFileInput';
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.className = 'hidden';
    userManagerCard.appendChild(input);
  }
  if (userManagerCard && !document.getElementById('exportUsersBtn')) {
    const wrap = document.createElement('div');
    wrap.id = 'usersExcelActions';
    wrap.className = 'grid3';
    wrap.style.marginTop = '0.5rem';
    wrap.innerHTML = '<button id="exportUsersBtn" class="secondary" type="button">Descargar usuarios (XLSX)</button><button id="importUsersBtn" class="secondary" type="button">Subir usuarios (XLSX)</button>';
    userManagerCard.appendChild(wrap);
  }
  const saveUsersBtn = document.getElementById('saveUsersChangesBtn');
  if (saveUsersBtn) saveUsersBtn.onclick = async () => {
    console.info('[users][save] Guardando usuarios manualmente', { usersCount: state.users?.length || 0 });
    persist({ module: 'users' });
    try {
      await syncToCloud();
      await pullFromCloud({ force: true });
      setMsg(homeMessage, 'Usuarios y permisos guardados correctamente.');
    } catch (err) {
      console.error('[users][sync] Error guardando usuarios en cloud', { message: err?.message, code: err?.code, status: err?.status });
      setMsg(homeMessage, 'No se pudo guardar usuarios en cloud.', false);
    }
  };
  const exportUsersBtn = document.getElementById('exportUsersBtn');
  if (exportUsersBtn) exportUsersBtn.onclick = exportUsersToExcel;
  const importUsersBtn = document.getElementById('importUsersBtn');
  const usersImportFileInput = document.getElementById('usersImportFileInput');
  if (importUsersBtn && usersImportFileInput) importUsersBtn.onclick = () => usersImportFileInput.click();
  if (usersImportFileInput) usersImportFileInput.onchange = (e) => {
    const file = e.target?.files?.[0];
    importUsersFromExcelFile(file);
    usersImportFileInput.value = '';
  };
}

function renderUsersActivityView() {
  if (!userManagerCard || !usersTable) return;
  const table = usersTable.closest('table');
  if (!table) return;
  table.classList.remove('hidden');
  toggleUserFormBtn?.classList.add('hidden');
  const now = Date.now();
  table.querySelector('thead tr').innerHTML = '<th>Usuario</th><th>Estado</th><th>Última actividad</th><th>Tiempo transcurrido</th>';
  usersTable.innerHTML = (state.users || []).map((u) => {
    const last = Number(u.lastActivityAt || 0);
    const active = u.enabled !== false && last && (now - last) < SESSION_INACTIVITY_LIMIT_MS;
    const stateText = active ? '🟢 Activo' : '🔴 Inactivo';
    return `<tr><td>${u.username}</td><td>${stateText}</td><td>${last ? new Date(last).toLocaleString() : '-'}</td><td>${last ? humanElapsed(last) : 'Sin actividad'}</td></tr>`;
  }).join('') || '<tr><td colspan="4">Sin usuarios.</td></tr>';
  if (!document.getElementById('backFromUsersActivityBtn')) {
    const backBtn = document.createElement('button');
    backBtn.id = 'backFromUsersActivityBtn';
    backBtn.className = 'secondary';
    backBtn.type = 'button';
    backBtn.textContent = 'Volver a gestión de usuarios';
    backBtn.style.marginBottom = '0.5rem';
    table.insertAdjacentElement('beforebegin', backBtn);
    backBtn.addEventListener('click', () => navigateTo('settings/users', { replace: true }));
  }
}

function exportUsersToExcel() {
  if (!window.XLSX) return alert('No se pudo cargar la librería XLSX.');
  const permissionKeys = permissionSchema().map((p) => p.key);
  const rows = (state.users || []).map((u) => {
    const row = { Usuario: u.username || '', Contraseña: u.password || '' };
    permissionKeys.forEach((key) => { row[key] = u.username === 'admin' ? 1 : (u.permissions?.[key] ? 1 : 0); });
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rows, { header: ['Usuario', 'Contraseña', ...permissionKeys] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'USUARIOS');
  XLSX.writeFile(wb, 'usuarios_sistema.xlsx');
}

function importUsersFromExcelFile(file) {
  if (!window.XLSX || !file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) return alert('El archivo no contiene filas válidas.');
      const permissionKeys = permissionSchema().map((p) => p.key);
      const usersMap = new Map((state.users || []).map((u) => [String(u.username || '').trim().toLowerCase(), u]));
      rows.forEach((row) => {
        const username = String(row.Usuario || '').trim();
        if (!username) return;
        const password = String(row.Contraseña || '').trim();
        const key = username.toLowerCase();
        const existing = usersMap.get(key);
        const base = existing || { username, password: password || '1234', permissions: defaultPermissions(), createdBy: state.currentUser?.username || 'admin' };
        base.username = username;
        if (password) base.password = password;
        if (!base.permissions) base.permissions = defaultPermissions();
        permissionKeys.forEach((perm) => {
          const val = row[perm];
          base.permissions[perm] = String(val).trim() === '1' || String(val).toLowerCase() === 'true';
        });
        if (username === 'admin') base.permissions = defaultPermissions();
        usersMap.set(key, base);
      });
      state.users = [...usersMap.values()];
      console.info('[users][import] usuarios cargados desde XLSX', { importedRows: rows.length, usersCount: state.users.length });
      ensureUsers();
      persist({ module: 'users' });
      renderUsers();
      Promise.resolve().then(async () => {
        try {
          await syncToCloud();
          await pullFromCloud({ force: true });
          console.info('[users][sync] usuarios importados sincronizados', { usersCount: state.users.length });
          alert('Usuarios importados correctamente.');
        } catch (err) {
          console.error('[users][sync] fallo sincronizando usuarios importados', { message: err?.message, code: err?.code, status: err?.status });
          alert('Usuarios importados localmente, pero falló sincronización cloud.');
        }
      });
    } catch (error) {
      console.error('[users][import] import error', error);
      alert('No se pudo importar el archivo de usuarios.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function normalizeProductName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isStockEnabled() {
  return Boolean(appConfig.stockActivo);
}

function comboComponentRequirements(product, qty = 1) {
  const req = new Map();
  if (!product || !Array.isArray(product.combo) || !product.combo.length) return req;
  product.combo.forEach((id) => {
    req.set(id, (req.get(id) || 0) + Number(qty || 0));
  });
  return req;
}


function normalizeDebtPaymentsData() {
  if (!Array.isArray(state.debtPayments)) state.debtPayments = [];
  state.debtPayments = state.debtPayments.filter(Boolean).map((p) => ({
    ...p,
    saleId: p.saleId || p.ventaId || '',
    archivado: Boolean(p.archivado),
    anulado: Boolean(p.anulado),
    anuladoPorVentaId: p.anuladoPorVentaId || '',
    anuladoAt: p.anuladoAt || '',
    anuladoBy: p.anuladoBy || ''
  }));
}

function normalizeWarehouseData() {
  if (!Array.isArray(state.components)) state.components = [];
  if (!state.componentLinks || typeof state.componentLinks !== 'object') state.componentLinks = {};
  if (!Array.isArray(state.componentMoves)) state.componentMoves = [];
  state.componentMoves = state.componentMoves.filter(Boolean).map((m) => ({ ...m, archived: Boolean(m.archived), archivedDate: m.archivedDate || '', tipo: m.tipo === 'venta' ? 'uso' : (m.tipo || 'ajuste_manual') }));
}

function componentById(id) {
  return (state.components || []).find((c) => c.id === id) || null;
}

function productComponentLinks(productId) {
  const links = state.componentLinks?.[productId] || [];
  return Array.isArray(links) ? links : [];
}

function registerComponentMove({ componentId, tipo, cantidad, descripcion = '' }) {
  const component = componentById(componentId);
  if (!component) return;
  component.qty = Number(component.qty || 0) + Number(cantidad || 0);
  state.componentMoves.unshift({
    id: uid(),
    componentId,
    componentName: component.name,
    tipo,
    cantidad: Number(cantidad || 0),
    fecha: new Date().toISOString(),
    usuario: state.currentUser?.username || '-',
    descripcion
  });
}

function applyWarehouseImpactFromSaleItems(items = [], { reverse = false, saleId = '' } = {}) {
  (items || []).forEach((it) => {
    const links = productComponentLinks(it.id);
    links.forEach((ln) => {
      const qty = Number(ln.qty || 0) * Number(it.qty || 0);
      if (!qty) return;
      registerComponentMove({
        componentId: ln.componentId,
        tipo: reverse ? 'reverso_venta' : 'uso',
        cantidad: reverse ? qty : -qty,
        descripcion: reverse ? `Reverso venta ${saleId || ''}` : `Venta ${saleId || ''}`
      });
    });
  });
}


function warehouseMoveDateKey(move) {
  return String(move?.fecha || '').slice(0, 10);
}

function openWarehouseNewTab(route = 'warehouse/gestion') {
  const base = `${window.location.origin}${window.location.pathname}`;
  window.open(`${base}#${normalizeRoute(route)}`, '_blank');
}

function renderWarehouseMovesSection(route = 'warehouse') {
  if (!warehouseMovesTable) return;
  const card = warehouseMovesTable.closest('.card');
  const activeMoves = (state.componentMoves || []).filter((m) => m && !m.archived);
  const archivedMoves = (state.componentMoves || []).filter((m) => m && m.archived);
  const currentRoute = normalizeRoute(route);

  if (card && !document.getElementById('warehouseMovesHeaderActions')) {
    const actions = document.createElement('div');
    actions.id = 'warehouseMovesHeaderActions';
    actions.className = 'grid3';
    actions.innerHTML = '<button id="warehouseActiveMovesBtn" class="secondary" type="button">Movimientos</button><button id="warehouseArchivedMovesBtn" class="secondary" type="button">Archivados</button><button id="warehouseArchiveTodayBtn" class="secondary" type="button">Archivar día actual</button>';
    card.insertBefore(actions, card.querySelector('table'));
    document.getElementById('warehouseActiveMovesBtn')?.addEventListener('click', () => navigateTo('warehouse/movimientos', { replace: true }));
    document.getElementById('warehouseArchivedMovesBtn')?.addEventListener('click', () => navigateTo('warehouse/movimientos/archivados', { replace: true }));
    document.getElementById('warehouseArchiveTodayBtn')?.addEventListener('click', () => {
      const today = new Date().toISOString().slice(0, 10);
      let count = 0;
      (state.componentMoves || []).forEach((m) => {
        if (!m || m.archived) return;
        if (warehouseMoveDateKey(m) !== today) return;
        m.archived = true;
        m.archivedDate = today;
        count += 1;
      });
      persist();
      renderWarehouse();
      if (warehouseStatus) warehouseStatus.textContent = count ? `Se archivaron ${count} movimientos del día ${today}.` : 'No hay movimientos activos del día actual para archivar.';
    });
  }

  if (currentRoute === 'warehouse/movimientos/archivados') {
    const grouped = new Map();
    archivedMoves.forEach((m) => {
      const key = m.archivedDate || warehouseMoveDateKey(m);
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    const rows = [...grouped.entries()].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
    const thead = warehouseMovesTable.closest('table')?.querySelector('thead tr');
    if (thead) thead.innerHTML = '<th>Fecha</th><th>Total movimientos</th><th>Acción</th>';
    warehouseMovesTable.innerHTML = rows.length ? rows.map(([day, qty]) => `<tr><td>${day}</td><td>${qty}</td><td><button class="secondary" data-wh-arch-day="${day}" type="button">Ver detalles</button></td></tr>`).join('') : '<tr><td colspan="3">Sin movimientos archivados.</td></tr>';
    warehouseMovesTable.onclick = (e) => {
      const btn = e.target.closest('button[data-wh-arch-day]');
      if (!btn) return;
      navigateTo(`warehouse/movimientos/archivados/${encodeURIComponent(btn.dataset.whArchDay || '')}`, { replace: true });
    };
    return;
  }

  if (currentRoute.startsWith('warehouse/movimientos/archivados/')) {
    const day = decodeURIComponent(currentRoute.split('warehouse/movimientos/archivados/')[1] || '');
    const list = archivedMoves.filter((m) => (m.archivedDate || warehouseMoveDateKey(m)) === day);
    const thead = warehouseMovesTable.closest('table')?.querySelector('thead tr');
    if (thead) thead.innerHTML = '<th>Hora</th><th>Componente</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th>';
    warehouseMovesTable.innerHTML = list.length ? list.map((m) => `<tr><td>${new Date(m.fecha || Date.now()).toLocaleTimeString()}</td><td>${m.componentName || '-'}</td><td>${m.tipo || '-'}</td><td>${Number(m.cantidad || 0)}</td><td>${m.usuario || '-'}</td></tr>`).join('') : '<tr><td colspan="5">Sin movimientos para la fecha seleccionada.</td></tr>';
    return;
  }

  const thead = warehouseMovesTable.closest('table')?.querySelector('thead tr');
  if (thead) thead.innerHTML = '<th>Fecha</th><th>Hora</th><th>Componente</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th>';
  warehouseMovesTable.innerHTML = activeMoves.slice(0, 500).map((m) => `<tr><td>${(m.fecha || '').slice(0, 10)}</td><td>${new Date(m.fecha || Date.now()).toLocaleTimeString()}</td><td>${m.componentName || '-'}</td><td>${m.tipo || '-'}</td><td>${Number(m.cantidad || 0)}</td><td>${m.usuario || '-'}</td></tr>`).join('') || '<tr><td colspan="6">Sin movimientos activos.</td></tr>';
}

function openWarehouseResetModal() {
  if (!state.currentUser) return;
  const overlayId = 'warehouseResetOverlay';
  document.getElementById(overlayId)?.remove();
  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Restablecer Almacén</h3><p>Esta acción eliminará completamente toda la información del almacén. Esta acción NO se puede deshacer.</p><label>Para confirmar, ingrese su contraseña.<input id="warehouseResetPassInput" type="password" placeholder="Contraseña actual" /></label><div class="grid2"><button id="warehouseResetConfirmBtn" class="danger" type="button">Confirmar</button><button id="warehouseResetCancelBtn" class="secondary" type="button">Cancelar</button></div><p id="warehouseResetMsg"></p></div>`;
  document.body.appendChild(overlay);
  document.getElementById('warehouseResetCancelBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('warehouseResetConfirmBtn')?.addEventListener('click', () => {
    const pass = String(document.getElementById('warehouseResetPassInput')?.value || '').trim();
    const user = currentUserRecord();
    if (!user || pass !== String(user.password || '')) {
      const msg = document.getElementById('warehouseResetMsg');
      if (msg) { msg.textContent = 'Contraseña incorrecta.'; msg.className = 'error'; }
      return;
    }
    state.components = [];
    state.componentLinks = {};
    state.componentMoves = [];
    persist();
    renderWarehouse();
    overlay.remove();
    if (warehouseStatus) warehouseStatus.textContent = 'Almacén restablecido correctamente.';
  });
}

function renderWarehouse() {
  if (!warehouseTable) return;
  normalizeWarehouseData();
  const canView = hasPermission('viewWarehouseButton');
  if (!canView) {
    warehouseStatus && (warehouseStatus.textContent = 'No tienes permiso para ver Almacén.');
    homeScreen?.classList.remove('hidden');
    warehouseScreen?.classList.add('hidden');
    return;
  }

  const currentRoute = normalizeRoute(window.location.hash || '#warehouse');
  if (warehouseStatus) warehouseStatus.textContent = 'Gestión de componentes, recetas y movimientos.';

  if (!document.getElementById('warehouseTopActions')) {
    const wrap = document.createElement('div');
    wrap.id = 'warehouseTopActions';
    wrap.className = 'grid3';
    wrap.innerHTML = '<button id="openWarehouseManagementTabBtn" class="secondary" type="button">Gestión de Componentes y Recetas</button><button id="openWarehouseMovesTabBtn" class="secondary" type="button">Movimientos</button><button id="warehouseResetBtn" class="danger" type="button">Restablecer Almacén</button>';
    warehouseStatus?.insertAdjacentElement('afterend', wrap);
    document.getElementById('openWarehouseManagementTabBtn')?.addEventListener('click', () => openWarehouseNewTab('warehouse/gestion'));
    document.getElementById('openWarehouseMovesTabBtn')?.addEventListener('click', () => openWarehouseNewTab('warehouse/movimientos'));
    document.getElementById('warehouseResetBtn')?.addEventListener('click', openWarehouseResetModal);
  }

  const managementVisible = currentRoute === 'warehouse' || currentRoute === 'warehouse/gestion';
  const movesCard = warehouseMovesTable?.closest('.card');
  if (warehouseProductSelect?.closest('.grid3')) warehouseProductSelect.closest('.grid3').classList.toggle('hidden', !managementVisible);
  if (warehouseMoveComponentSelect?.closest('.grid4')) warehouseMoveComponentSelect.closest('.grid4').classList.toggle('hidden', managementVisible);
  if (movesCard) movesCard.classList.remove('hidden');

  if (warehouseProductSelect) warehouseProductSelect.innerHTML = (state.products || []).map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  const compOpts = (state.components || []).map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  if (warehouseComponentSelect) warehouseComponentSelect.innerHTML = compOpts;
  if (warehouseMoveComponentSelect) warehouseMoveComponentSelect.innerHTML = compOpts;

  const rows = (state.components || []).map((c) => {
    const linked = Object.entries(state.componentLinks || {}).flatMap(([pid, arr]) => (arr || []).filter((x) => x.componentId === c.id).map((x) => ({ pid, qty: x.qty })));
    const low = Number(c.qty || 0) <= Number(c.min || 0);
    const linkedProducts = linked.length ? `<ul>${linked.map((x) => `<li>${state.products.find((p) => p.id === x.pid)?.name || '-'}</li>`).join('')}</ul>` : '-';
    const linkedQty = linked.length ? `<ul>${linked.map((x) => `<li>${Number(x.qty || 0)}</li>`).join('')}</ul>` : '-';
    return { html: `<tr class="${low ? 'selected-row stock-empty' : ''}"><td>${c.name}</td><td>${linkedProducts}</td><td>${linkedQty}</td><td>${Number(c.qty || 0)}</td><td><button class="secondary" data-comp-edit="${c.id}" type="button">Editar</button> <button class="secondary" data-comp-del="${c.id}" type="button">Eliminar</button></td></tr>`, low };
  }).sort((a, b) => Number(b.low) - Number(a.low));
  warehouseTable.innerHTML = rows.length ? rows.map((x) => x.html).join('') : '<tr><td colspan="5">Sin componentes.</td></tr>';

  if (!document.getElementById('warehouseBottomActions')) {
    const bottom = document.createElement('div');
    bottom.id = 'warehouseBottomActions';
    bottom.className = 'grid2';
    bottom.innerHTML = '<button id="warehouseBottomMovesBtn" class="secondary" type="button">Movimientos</button><button id="warehouseBottomResetBtn" class="danger" type="button">Restablecer Almacén</button>';
    warehouseTable.closest('table')?.insertAdjacentElement('afterend', bottom);
    document.getElementById('warehouseBottomMovesBtn')?.addEventListener('click', () => navigateTo('warehouse/movimientos'));
    document.getElementById('warehouseBottomResetBtn')?.addEventListener('click', openWarehouseResetModal);
  }

  renderWarehouseMovesSection(currentRoute);
}


function exportProductsToExcel() {
  if (!window.XLSX) return alert('No se pudo cargar la librería XLSX.');
  const rows = (state.products || []).map((p) => ({ PRODUCTO: String(p.name || '').trim(), CATEGORIA: String(p.category || 'Todos').trim(), PRECIO: Number(p.price || 0) }));
  const ws = XLSX.utils.json_to_sheet(rows, { header: ['PRODUCTO', 'CATEGORIA', 'PRECIO'] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PRODUCTOS');
  XLSX.writeFile(wb, 'productos_pos.xlsx');
}

function importProductsFromExcelFile(file) {
  if (!window.XLSX) return alert('No se pudo cargar la librería XLSX.');
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const headers = Object.keys(rows[0] || {});
      const expected = ['PRODUCTO', 'CATEGORIA', 'PRECIO'];
      const validHeaders = headers.length === expected.length && expected.every((h) => headers.includes(h));
      if (!rows.length || !validHeaders) {
        alert('Formato inválido. Debe contener exactamente: PRODUCTO | CATEGORIA | PRECIO');
        return;
      }
      let created = 0;
      let updated = 0;
      const errors = [];
      const existingMap = new Map((state.products || []).map((p) => [normalizeProductName(p.name), p]));
      rows.forEach((row, idx) => {
        const productName = String(row.PRODUCTO || '').trim();
        const category = String(row.CATEGORIA || 'Todos').trim() || 'Todos';
        const price = Number(row.PRECIO);
        if (!productName) { errors.push(`Fila ${idx + 2}: PRODUCTO vacío`); return; }
        if (Number.isNaN(price)) { errors.push(`Fila ${idx + 2}: PRECIO inválido`); return; }
        const key = normalizeProductName(productName);
        const found = existingMap.get(key);
        if (!found) {
          state.products.push({ id: uid(), name: productName, category, price, hidden: false });
          existingMap.set(key, state.products[state.products.length - 1]);
          created += 1;
        } else {
          found.name = productName;
          found.category = category;
          found.price = price;
          updated += 1;
        }
        if (!state.categories.includes(category)) state.categories.push(category);
      });
      persist();
      renderProducts();
      renderSaleSelectors();
      alert(`Importación finalizada.\nCreados: ${created}\nActualizados: ${updated}\nErrores: ${errors.length}${errors.length ? `\n\n${errors.join('\n')}` : ''}`);
    } catch (error) {
      console.error('[excel] error al importar', error);
      alert('No se pudo importar el archivo Excel.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderStockView() {
  if (!stockTable || !stockProductSelect) return;
  const enabled = Boolean(appConfig.stockActivo);
  stockProductSelect.innerHTML = (state.products || []).map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  stockTable.innerHTML = (state.products || []).map((p) => {
    const low = enabled && Number(p.stockCurrent || 0) <= Number(appConfig.stockMinimo || 0);
    const alertText = low ? '⚠ Bajo stock' : '-';
    const alertClass = low ? 'stock-warning' : '';
    return `<tr><td>${p.name}</td><td>${p.category || '-'}</td><td>${Number(p.stockCurrent || 0)}</td><td class="${alertClass}">${alertText}</td></tr>`;
  }).join('');
}

function addStockManually() {
  const productId = stockProductSelect?.value || '';
  const qty = Math.max(1, Number(stockAddQtyInput?.value || 1));
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;
  product.stockCurrent = Number(product.stockCurrent || 0) + qty;
  persist();
  renderProducts();
  renderSaleSelectors();
  renderStockView();
}

function exportStockToExcel() {
  if (!window.XLSX) return alert('No se pudo cargar XLSX.');
  const rows = (state.products || []).map((p) => ({ PRODUCTO: String(p.name || '').trim(), 'CANTIDAD ACTUAL': Number(p.stockCurrent || 0) }));
  const ws = XLSX.utils.json_to_sheet(rows, { header: ['PRODUCTO', 'CANTIDAD ACTUAL'] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'STOCK');
  XLSX.writeFile(wb, 'stock_pos.xlsx');
}

function importStockFromExcelFile(file) {
  if (!window.XLSX || !file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const headers = Object.keys(rows[0] || {});
      const expected = ['PRODUCTO', 'CANTIDAD ACTUAL'];
      const valid = headers.length == expected.length && expected.every((h) => headers.includes(h));
      if (!rows.length || !valid) return alert('Formato inválido. Use: PRODUCTO | CANTIDAD ACTUAL');
      let updated = 0;
      const errors = [];
      const map = new Map((state.products || []).map((p) => [normalizeProductName(p.name), p]));
      rows.forEach((row, idx) => {
        const name = String(row.PRODUCTO || '').trim();
        const add = Number(row['CANTIDAD ACTUAL']);
        if (!name) return errors.push(`Fila ${idx + 2}: PRODUCTO vacío`);
        if (Number.isNaN(add)) return errors.push(`Fila ${idx + 2}: CANTIDAD ACTUAL inválida`);
        const prod = map.get(normalizeProductName(name));
        if (!prod) return errors.push(`Fila ${idx + 2}: producto no existe`);
        prod.stockCurrent = Number(prod.stockCurrent || 0) + add;
        updated += 1;
      });
      persist();
      renderProducts();
      renderSaleSelectors();
      renderStockView();
      alert(`Importación de stock finalizada.\nProductos actualizados: ${updated}\nErrores: ${errors.length}${errors.length ? `\n\n${errors.join('\n')}` : ''}`);
    } catch (e) {
      console.error('[stock] import error', e);
      alert('No se pudo importar stock.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function hideProductSubviews() {
  createProductCard?.classList.add('hidden');
  manageCategoriesCard?.classList.add('hidden');
  createComboCard?.classList.add('hidden');
  stockCard?.classList.add('hidden');
  productListCard?.classList.add('hidden');
}

function openProductListView() {
  hideProductSubviews();
  productListCard?.classList.remove('hidden');
  renderProducts();
}

function renderImageRetryHint(kind, key, value) {
  const raw = String(value || '');
  if (!raw.startsWith('idb:')) return '';
  const meta = imageMissingRefs[raw];
  if (!meta?.missing) return '';
  return `<div class="upload-error">Imagen no disponible en este navegador.</div><button class="secondary" data-img-retry-kind="${kind}" data-img-retry-key="${escapeHtml(String(key || ''))}" type="button">Reintentar</button>`;
}

function renderProducts() {
  const selectedCategory = productCategory?.value || '';
  const sorted = state.products.slice().sort((a, b) => Number(Boolean(a.hidden)) - Number(Boolean(b.hidden)));
  const productsHead = productsTable?.closest('table')?.querySelector('thead tr');
  if (productsHead) productsHead.innerHTML = '<th>Categoría</th><th>Producto</th><th>Precio</th><th>Acciones</th><th>Imagen</th>';
  const categoriesHead = categoriesTable?.closest('table')?.querySelector('thead tr');
  if (categoriesHead) categoriesHead.innerHTML = '<th>Categoría</th><th>Acciones</th><th>Imagen</th>';
  if (productsTable) productsTable.innerHTML = sorted.map((p) => { const st = getImageUploadStatus('product', p.id); const uploadBtnText = st?.uploading ? 'Subiendo...' : 'Subir imagen'; const prodSrc = resolveImageSource(p.imageUrl || p.imageDataUrl); const imageBlock = prodSrc ? `<div class=\"image-cell\"><img class=\"image-thumb\" src=\"${prodSrc}\" alt=\"${p.name}\" loading=\"lazy\" /><button class=\"danger\" data-prod-img-del=\"${p.id}\" type=\"button\">X</button></div>` : '<span class=\"muted\">Sin imagen</span>'; const err = st?.error ? `<div class=\"upload-error\">${st.error}</div>` : ''; const retry = renderImageRetryHint('product', p.id, p.imageUrl || p.imageDataUrl); return `<tr><td>${p.category || '-'}</td><td>${p.name}</td><td>${money(p.price)}</td><td><button class=\"secondary\" data-prod-edit=\"${p.id}\" type=\"button\">Editar</button> <button class=\"secondary\" data-prod-img=\"${p.id}\" type=\"button\" ${st?.uploading ? 'disabled' : ''}>${uploadBtnText}</button> <button class=\"secondary\" data-prod-hide=\"${p.id}\" type=\"button\">${p.hidden ? 'Mostrar' : 'Ocultar'}</button> <button class=\"secondary\" data-prod-del=\"${p.id}\" type=\"button\">Eliminar</button></td><td>${imageBlock}${renderImageUploadProgress('product', p.id)}${err}${retry}</td></tr>`; }).join('');
  if (categoriesTable) categoriesTable.innerHTML = (state.categories || []).map((c) => { const st = getImageUploadStatus('category', c); const uploadBtnText = st?.uploading ? 'Subiendo...' : 'Subir imagen'; const catSrc = resolveImageSource(state.categoryImages?.[c]); const imageBlock = catSrc ? `<div class=\"image-cell\"><img class=\"image-thumb\" src=\"${catSrc}\" alt=\"${c}\" loading=\"lazy\" /><button class=\"danger\" data-cat-img-del=\"${c}\" type=\"button\">X</button></div>` : '<span class=\"muted\">Sin imagen</span>'; const err = st?.error ? `<div class=\"upload-error\">${st.error}</div>` : ''; const retry = renderImageRetryHint('category', c, state.categoryImages?.[c]); return `<tr><td>${c}</td><td><button class=\"secondary\" data-cat-img=\"${c}\" type=\"button\" ${st?.uploading ? 'disabled' : ''}>${uploadBtnText}</button> ${c === 'Todos' ? '' : `<button class=\"secondary\" data-cat-del=\"${c}\" type=\"button\">Eliminar</button>`}</td><td>${imageBlock}${renderImageUploadProgress('category', c)}${err}${retry}</td></tr>`; }).join('');
  if (productCategory) {
    productCategory.innerHTML = (state.categories || []).map((c) => `<option value="${c}">${c}</option>`).join('');
    if (selectedCategory && state.categories.includes(selectedCategory)) productCategory.value = selectedCategory;
  }
  if (comboProductsSelect) comboProductsSelect.innerHTML = state.products.filter((p) => !p.hidden).map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  if (openStockBtn) openStockBtn.classList.toggle('hidden', !appConfig.stockActivo);
  renderComboBuilder();
  if (appConfig.stockActivo) renderStockView();
}


function renderComboBuilder() {
  const host = document.getElementById('comboItemsTable');
  if (!host) return;
  const cats = [...new Set(state.products.filter((p) => !p.hidden).map((p) => p.category))];
  const toolbarId = 'comboBuilderToolbar';
  let toolbar = document.getElementById(toolbarId);
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = toolbarId;
    toolbar.className = 'card grid4';
    toolbar.innerHTML = '<label>Categoría<select id="comboCatSel"></select></label><label>Producto<select id="comboProdSel"></select></label><label>Cantidad<input id="comboQty" type="number" min="1" value="1" /></label><button id="comboAddBtn" class="secondary" type="button">Añadir al combo</button>';
    host.parentElement.insertBefore(toolbar, host.parentElement.querySelector('table'));
  }
  const catSel = document.getElementById('comboCatSel');
  const prodSel = document.getElementById('comboProdSel');
  const prevCat = catSel?.value || '';
  if (catSel) catSel.innerHTML = cats.map((c) => `<option value="${c}">${c}</option>`).join('');
  if (catSel && prevCat && cats.includes(prevCat)) catSel.value = prevCat;
  const sync = () => {
    const cat = catSel?.value || cats[0] || '';
    const prods = state.products.filter((p) => !p.hidden && p.category === cat);
    if (prodSel) prodSel.innerHTML = prods.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
    const addBtn = document.getElementById('comboAddBtn');
    if (addBtn) addBtn.disabled = prods.length === 0;
  };
  catSel?.addEventListener('change', sync);
  sync();
  const rerender = () => {
    host.innerHTML = state.comboBuilderItems.map((x, idx) => `<tr><td>${x.name}</td><td><input type="number" min="1" value="${x.qty}" data-combo-qty="${idx}" /></td><td>${money(x.price * x.qty)}</td><td><button class="secondary" data-combo-rm="${idx}" type="button">Quitar</button></td></tr>`).join('');
    state.comboDraft = state.comboBuilderItems.flatMap((x) => Array.from({ length: x.qty }).map(() => ({ id: x.id })));
    const total = state.comboBuilderItems.reduce((a, x) => a + (x.price * x.qty), 0);
    if (comboCalculatedTotal) comboCalculatedTotal.textContent = `Total original: ${money(total)}`;
  };
  document.getElementById('comboAddBtn')?.addEventListener('click', () => {
    const p = state.products.find((x) => x.id === prodSel?.value);
    const qty = Math.max(1, Number(document.getElementById('comboQty')?.value || 1));
    if (!p) return;
    const ex = state.comboBuilderItems.find((x) => x.id === p.id);
    if (ex) ex.qty += qty;
    else state.comboBuilderItems.push({ id: p.id, name: p.name, price: Number(p.price || 0), qty });
    rerender();
  });
  host.oninput = (e) => {
    const inp = e.target.closest('input[data-combo-qty]');
    if (!inp) return;
    const idx = Number(inp.dataset.comboQty || 0);
    const row = state.comboBuilderItems[idx];
    if (!row) return;
    row.qty = Math.max(1, Number(inp.value || 1));
    rerender();
  };
  host.onclick = (e) => {
    const b = e.target.closest('button[data-combo-rm]');
    if (!b) return;
    state.comboBuilderItems.splice(Number(b.dataset.comboRm), 1);
    rerender();
  };
  rerender();
}

function renderOutflows() {
  if (!outflowsTable) return;
  const list = state.activeCashBoxId ? (state.outflows || []).filter((o) => o.cashBoxId === state.activeCashBoxId) : [];
  outflowsTable.innerHTML = list.map((o) => `<tr><td>${new Date(o.createdAt).toLocaleString()}</td><td>${o.direction}</td><td>${o.method}</td><td>${o.description}</td><td>${money(o.amount)}</td><td>${o.direction === 'entrada' ? '+' : '-'}</td><td><button class="secondary" data-out-del="${o.id}" type="button">Eliminar</button></td></tr>`).join('');
}

function renderSummary() {
  const activeCash = getActiveCashBox();
  if (!activeCash) {
    if (summarySalesCount) summarySalesCount.textContent = '0';
    if (summaryTotal) summaryTotal.textContent = money(0);
    if (summaryCashDetail) summaryCashDetail.textContent = money(0);
    if (summaryQrDetail) summaryQrDetail.textContent = money(0);
    if (summaryBox) summaryBox.textContent = money(0);
    if (summaryDebt) summaryDebt.textContent = money(0);
    if (summaryCash) summaryCash.textContent = money(0);
    if (summaryBoxInCash) summaryBoxInCash.textContent = money(0);
    if (summaryOutCash) summaryOutCash.textContent = money(0);
    if (summaryInCash) summaryInCash.textContent = money(0);
    if (summaryNetCash) summaryNetCash.textContent = money(0);
    if (summaryFinalCash) summaryFinalCash.textContent = money(0);
    if (summaryQr) summaryQr.textContent = money(0);
    if (summaryOutQr) summaryOutQr.textContent = money(0);
    if (summaryInQr) summaryInQr.textContent = money(0);
    if (summaryFinalQr) summaryFinalQr.textContent = money(0);
    if (cashTotalBox) cashTotalBox.textContent = money(0);
    if (qrTotalBox) qrTotalBox.textContent = money(0);
    return;
  }

  const sales = salesForActiveCashBox().filter((s) => !s.carryOverDebt);
  console.info('[sale][summary] calculando resumen', { activeCashBoxId: state.activeCashBoxId || '', salesCount: sales.length });
  const debtPayments = activeDebtPayments().filter((p) => p.cashBoxId === state.activeCashBoxId);
  const cashSales = sales.reduce((a, s) => a + Number(s.breakdown?.cash || 0), 0);
  const qrSales = sales.reduce((a, s) => a + Number(s.breakdown?.qr || 0), 0);
  const debtCash = debtPayments.reduce((a, p) => a + Number(p.cashAmount || (p.method === 'efectivo' ? p.amount : 0) || 0), 0);
  const debtQr = debtPayments.reduce((a, p) => a + Number(p.qrAmount || (p.method === 'qr' ? p.amount : 0) || 0), 0);
  const cashInTotal = cashSales + debtCash;
  const qrInTotal = qrSales + debtQr;
  const debtPending = state.sales.reduce((a, s) => a + Number(s.debtAmount || 0), 0);
  const outflows = (state.outflows || []).filter((o) => o.cashBoxId === state.activeCashBoxId);
  const outCash = outflows.filter((o) => o.direction === 'salida' && o.method === 'efectivo').reduce((a, o) => a + Number(o.amount || 0), 0);
  const inCash = outflows.filter((o) => o.direction === 'entrada' && o.method === 'efectivo').reduce((a, o) => a + Number(o.amount || 0), 0);
  const outQr = outflows.filter((o) => o.direction === 'salida' && o.method === 'qr').reduce((a, o) => a + Number(o.amount || 0), 0);
  const inQr = outflows.filter((o) => o.direction === 'entrada' && o.method === 'qr').reduce((a, o) => a + Number(o.amount || 0), 0);
  const opening = Number(activeCash.openingCash || 0);
  const total = cashInTotal + qrInTotal + opening;
  console.info('[sale][cash]', { activeCashBoxId: state.activeCashBoxId || '', cashInTotal, qrInTotal, opening, total });

  if (summarySalesCount) summarySalesCount.textContent = String(sales.length);
  if (summaryTotal) summaryTotal.textContent = money(total);
  if (summaryCashDetail) summaryCashDetail.textContent = money(cashInTotal);
  if (summaryQrDetail) summaryQrDetail.textContent = money(qrInTotal);
  if (summaryBox) summaryBox.textContent = money(opening);
  if (summaryDebt) summaryDebt.textContent = money(debtPending);
  if (summaryCash) summaryCash.textContent = money(cashInTotal);
  if (summaryBoxInCash) summaryBoxInCash.textContent = money(opening);
  if (summaryOutCash) summaryOutCash.textContent = money(outCash);
  if (summaryInCash) summaryInCash.textContent = money(inCash);
  const netCash = opening + cashInTotal + inCash - outCash;
  if (summaryNetCash) summaryNetCash.textContent = money(netCash);
  if (summaryFinalCash) summaryFinalCash.textContent = money(cashInTotal + inCash - outCash);
  if (cashTotalBox) cashTotalBox.textContent = money(netCash);
  if (summaryQr) summaryQr.textContent = money(qrInTotal);
  if (summaryOutQr) summaryOutQr.textContent = money(outQr);
  if (summaryInQr) summaryInQr.textContent = money(inQr);
  if (summaryFinalQr) summaryFinalQr.textContent = money(qrInTotal + inQr - outQr);
  if (qrTotalBox) qrTotalBox.textContent = money(qrInTotal + inQr - outQr);
}



function renderSoldProductsList() {
  if (!soldProductsTable) return;
  const list = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt);
  const map = new Map();
  list.forEach((sale) => (sale.items || []).forEach((it) => {
    const key = it.name;
    map.set(key, (map.get(key) || 0) + Number(it.qty || 0));
  }));
  soldProductsTable.innerHTML = map.size
    ? [...map.entries()].map(([name, qty]) => `<tr><td>${name}</td><td>${qty}</td></tr>`).join('')
    : '<tr><td colspan="2">Sin ventas en la caja actual.</td></tr>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

function billingSettings() {
  return normalizeBillingSettings();
}

function buildInvoiceData(sale) {
  const cfg = billingSettings();
  const items = (sale?.items || []).map((it) => {
    const qty = Number(it.qty || 0);
    const unit = Number(it.price || 0);
    const lineTotal = Number(it.finalSubtotal ?? (unit * qty));
    const gross = unit * qty;
    return { name: String(it.name || 'Producto'), qty, unit, lineTotal, gross };
  });
  const totalItems = items.reduce((a, it) => a + it.qty, 0);
  const subtotal = items.reduce((a, it) => a + it.gross, 0);
  const finalTotal = Number(sale?.total || items.reduce((a, it) => a + it.lineTotal, 0));
  const discount = Math.max(0, subtotal - finalTotal);
  const symbol = cfg.currencySymbol || 'Bs';
  const breakdown = sale?.breakdown || {};
  let paymentLines = [`<p><strong>Método de pago:</strong> ${escapeHtml((sale?.payment || '-').toUpperCase())}</p>`];
  if (sale?.payment === 'efectivo') {
    paymentLines.push(`<p>Recibido: ${symbol} ${Number(breakdown.paid ?? finalTotal).toFixed(2)}</p>`);
    paymentLines.push(`<p>Cambio: ${symbol} ${Math.max(0, Number((breakdown.paid ?? finalTotal) - finalTotal)).toFixed(2)}</p>`);
  } else if (sale?.payment === 'qr') {
    paymentLines.push(`<p>Recibido QR: ${symbol} ${Number(breakdown.qr || finalTotal).toFixed(2)}</p>`);
  } else if (sale?.payment === 'mixto') {
    paymentLines.push(`<p>Efectivo: ${symbol} ${Number(breakdown.cash || 0).toFixed(2)}</p>`);
    paymentLines.push(`<p>QR: ${symbol} ${Number(breakdown.qr || 0).toFixed(2)}</p>`);
    paymentLines.push(`<p>Total: ${symbol} ${finalTotal.toFixed(2)}</p>`);
  } else if (sale?.payment === 'medio_pago') {
    paymentLines.push(`<p>Recibido efectivo: ${symbol} ${Number(breakdown.cash || 0).toFixed(2)}</p>`);
    paymentLines.push(`<p>Recibido QR: ${symbol} ${Number(breakdown.qr || 0).toFixed(2)}</p>`);
    paymentLines.push(`<p>Deuda: ${symbol} ${Number(sale?.debtAmount || 0).toFixed(2)}</p>`);
  } else if (sale?.payment === 'deuda') {
    paymentLines.push(`<p>Deuda: ${symbol} ${Number(sale?.debtAmount || finalTotal).toFixed(2)}</p>`);
  }
  return {
    config: { ...cfg },
    saleId: sale?.id || '',
    orderNumber: sale?.orderNumber,
    createdAt: sale?.createdAt || new Date().toISOString(),
    user: sale?.user || '-',
    items,
    totalItems,
    subtotal,
    discount,
    total: finalTotal,
    paymentHtml: paymentLines.join('')
  };
}

function billingPreviewConfig() {
  const cfg = normalizeBillingSettings();
  return {
    ...cfg,
    enabled: Boolean(billingEnabledInput?.checked ?? cfg.enabled),
    title: String(billingTitleInput?.value || state.settings?.title1 || cfg.title || 'Mi Cafetería'),
    currencySymbol: String(billingCurrencyInput?.value || cfg.currencySymbol || 'Bs'),
    marginMm: Number(billingMarginInput?.value || cfg.marginMm || 4),
    message1: String(billingMessage1Input?.value || cfg.message1 || ''),
    message2: String(billingMessage2Input?.value || cfg.message2 || ''),
    titleSizePt: Number(billingTitleSizeInput?.value || cfg.titleSizePt || 12),
    message1SizePt: Number(billingMessage1SizeInput?.value || cfg.message1SizePt || 9),
    message2SizePt: Number(billingMessage2SizeInput?.value || cfg.message2SizePt || 9),
    titleBold: Boolean(billingTitleBoldInput?.checked ?? cfg.titleBold),
    message1Bold: Boolean(billingMessage1BoldInput?.checked ?? cfg.message1Bold),
    message2Bold: Boolean(billingMessage2BoldInput?.checked ?? cfg.message2Bold),
    logoDataUrl: String(cfg.logoDataUrl || '')
  };
}

function ensureBillingPreviewUi() {
  if (!billingConfigCard) return null;
  let card = document.getElementById('billingPreviewCard');
  if (card) return card;
  card = document.createElement('div');
  card.id = 'billingPreviewCard';
  card.className = 'card';
  card.innerHTML = '<h4>VISTA PREVIA</h4><p class="muted">Vista de factura de prueba (no registra venta).</p><div id="billingPreviewBody"></div>';
  const anchor = billingConfigStatus || saveBillingConfigBtn;
  anchor?.insertAdjacentElement('afterend', card);
  return card;
}

function renderBillingPreview() {
  const card = ensureBillingPreviewUi();
  const body = document.getElementById('billingPreviewBody');
  if (!card || !body) return;
  const cfg = billingPreviewConfig();
  const items = [
    { name: 'Artículo 1', qty: 1, unit: 10, lineTotal: 10 },
    { name: 'Artículo 2', qty: 1, unit: 20, lineTotal: 20 },
    { name: 'Artículo 3', qty: 1, unit: 30, lineTotal: 30 }
  ];
  const subtotal = 60;
  const total = 60;
  const symbol = cfg.currencySymbol || 'Bs';
  const marginPx = Math.max(8, Math.round(Number(cfg.marginMm || 4) * 2.6));
  body.innerHTML = `<div style="max-width:360px;margin:0 auto;padding:${marginPx}px;border:1px dashed #9aa7b5;background:#fff;color:#1b2430;font-family:monospace;">
    ${cfg.logoDataUrl ? `<div style="text-align:center;margin-bottom:8px;"><img src="${cfg.logoDataUrl}" alt="logo" style="max-width:120px;max-height:70px;object-fit:contain;"></div>` : ''}
    <div style="text-align:center;font-size:${Math.max(11, Number(cfg.titleSizePt || 12))}pt;font-weight:${cfg.titleBold ? 700 : 400};margin-bottom:8px;">${escapeHtml(state.settings?.title1 || cfg.title || 'Mi Cafetería')}</div>
    <div>No Recibo: 999</div>
    <div>Fecha: ${new Date().toLocaleDateString()}</div>
    <div>Hora: ${new Date().toLocaleTimeString()}</div>
    <div>Usuario: demo</div>
    <hr>
    <table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr><th style="text-align:left;">Producto</th><th>Cant</th><th>PU</th><th>PT</th></tr></thead><tbody>${items.map((it)=>`<tr><td>${escapeHtml(it.name)}</td><td style="text-align:right;">${it.qty}</td><td style="text-align:right;">${symbol} ${it.unit.toFixed(2)}</td><td style="text-align:right;">${symbol} ${it.lineTotal.toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <hr>
    <div>Cantidad artículos: 3</div>
    <div>Subtotal: ${symbol} ${subtotal.toFixed(2)}</div>
    <div style="font-weight:700;">TOTAL: ${symbol} ${total.toFixed(2)}</div>
    <hr>
    <div>Método de pago: efectivo</div>
    <div>Recibido: ${symbol} 60.00</div>
    ${(cfg.message1 || cfg.message2) ? '<hr>' : ''}
    ${cfg.message1 ? `<div style="text-align:center;font-size:${Math.max(9, Number(cfg.message1SizePt || 9))}pt;font-weight:${cfg.message1Bold ? 700 : 400};">${escapeHtml(cfg.message1)}</div>` : ''}
    ${cfg.message2 ? `<div style="text-align:center;font-size:${Math.max(9, Number(cfg.message2SizePt || 9))}pt;font-weight:${cfg.message2Bold ? 700 : 400};">${escapeHtml(cfg.message2)}</div>` : ''}
  </div>`;
}

function estimateTicketHeightMm(data, cfg) {
  const itemsCount = Math.max(1, Number(data?.items?.length || 0));
  const hasDiscount = Number(data?.discount || 0) > 0;
  const paymentRows = invoicePaymentRows(data || {}, cfg?.currencySymbol || 'Bs').length;
  const logoBlock = cfg?.logoDataUrl ? Math.max(18, Number(cfg.logoSizeMm || 28) * 0.78) + Math.max(3, Number(cfg.logoTitleGapMm || 8) * 0.6) : 0;
  const topBlock = 34;
  const tableHeader = 9;
  const perItemRow = 6.4;
  const summaryRows = hasDiscount ? 4 : 3;
  const summaryBlock = 6 + (summaryRows * 5.4);
  const paymentBlock = 6 + (Math.max(2, paymentRows) * 5.2);
  const messageBlock = (cfg?.message1 ? 6 : 0) + (cfg?.message2 ? 6 : 0) + 10;
  const margin = Math.max(3, Number(cfg?.marginMm || 4));
  const raw = (margin * 2) + logoBlock + topBlock + tableHeader + (itemsCount * perItemRow) + summaryBlock + paymentBlock + messageBlock;
  return Math.max(170, Math.min(900, raw));
}

function invoicePaymentRows(sale, symbol) {
  const breakdown = sale?.breakdown || {};
  if (sale?.payment === 'efectivo') {
    const received = Number((breakdown.paid ?? sale?.total) || 0);
    const change = Math.max(0, received - Number(sale?.total || 0));
    return [['Método de pago', 'Efectivo'], ['Recibido', `${symbol} ${received.toFixed(2)}`], ['Cambio', `${symbol} ${change.toFixed(2)}`]];
  }
  if (sale?.payment === 'qr') {
    const received = Number((breakdown.qr ?? sale?.total) || 0);
    return [['Método de pago', 'QR'], ['Recibido QR', `${symbol} ${received.toFixed(2)}`]];
  }
  if (sale?.payment === 'mixto') {
    return [['Método de pago', 'Mixto'], ['Efectivo', `${symbol} ${Number(breakdown.cash || 0).toFixed(2)}`], ['QR', `${symbol} ${Number(breakdown.qr || 0).toFixed(2)}`], ['Total', `${symbol} ${Number(sale?.total || 0).toFixed(2)}`]];
  }
  if (sale?.payment === 'medio_pago') {
    return [['Método de pago', 'Medio pago'], ['Recibido efectivo', `${symbol} ${Number(breakdown.cash || 0).toFixed(2)}`], ['Recibido QR', `${symbol} ${Number(breakdown.qr || 0).toFixed(2)}`], ['Deuda', `${symbol} ${Number(sale?.debtAmount || 0).toFixed(2)}`]];
  }
  if (sale?.payment === 'deuda') {
    return [['Método de pago', 'Por pagar'], ['Deuda', `${symbol} ${Number((sale?.debtAmount || sale?.total) || 0).toFixed(2)}`]];
  }
  return [['Método de pago', String(sale?.payment || '-')]];
}

function closingSalesHistoryRows(closing) {
  const valid = Array.isArray(closing?.salesSnapshot) ? closing.salesSnapshot.map((sale) => ({
    ...sale,
    status: 'OK',
    statusLabel: 'OK',
    statusClass: ''
  })) : [];
  const deleted = Array.isArray(closing?.deletedSalesSnapshot) ? closing.deletedSalesSnapshot.map((sale) => ({
    ...sale,
    status: 'ANULADA',
    statusLabel: `ANULADA · eliminado por: ${sale.deletedBy || '-'}`,
    statusClass: 'sale-annulled'
  })) : [];
  return [...valid, ...deleted].sort((a, b) => new Date(a.createdAt || a.deletedAt || 0) - new Date(b.createdAt || b.deletedAt || 0));
}

function ensureClosingSalesHistoryTable() {
  if (!closingUsersTable) return null;
  let table = document.getElementById('closingSalesHistoryTable');
  if (table) return table;
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.innerHTML = '<h4>Historial de ventas de cierre</h4><table><thead><tr><th>Fecha</th><th>Nro pedido</th><th>Método</th><th>Total</th><th>Usuario</th><th>Estado</th></tr></thead><tbody id="closingSalesHistoryTable"></tbody></table>';
  const usersTableWrap = closingUsersTable.closest('table');
  usersTableWrap?.insertAdjacentElement('afterend', wrap);
  table = document.getElementById('closingSalesHistoryTable');
  return table;
}

async function openSaleInvoiceWindow(sale, options = {}) {
  if (!sale) return;
  const startedAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  if (options.syncBeforeOpen) await syncToCloud();
  const data = sale.invoiceSnapshot || buildInvoiceData(sale);
  const cfg = { ...defaultBillingConfig, ...(data?.config || {}), ...billingSettings() };
  const symbol = cfg.currencySymbol || 'Bs';
  const imageFormat = String(cfg.logoDataUrl || '').includes('image/jpeg') ? 'JPEG' : 'PNG';
  try {
    await ensureJsPdfLibs();
    const { jsPDF } = window.jspdf;
    const ticketWidth = Math.max(58, Math.min(120, Number(cfg.paperWidthMm || 80)));
    const ticketHeight = estimateTicketHeightMm(data, cfg);
    const doc = new jsPDF({ unit: 'mm', format: [ticketWidth, ticketHeight] });
    const margin = Math.max(3, Number(cfg.marginMm || 4));
    const contentWidth = ticketWidth - (margin * 2);
    const writeLine = (left, right, y, opts = {}) => {
      const fontSize = Number(opts.size || 9);
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      doc.text(String(left || ''), margin, y, { maxWidth: contentWidth * 0.62 });
      if (right !== undefined && right !== null && String(right) !== '') {
        doc.text(String(right), ticketWidth - margin, y, { align: 'right', maxWidth: contentWidth * 0.38 });
      }
      return y + Number(opts.step || 4.5);
    };

    let y = margin + 6;
    if (cfg.logoDataUrl) {
      try {
        const logoW = Math.max(12, Math.min(56, Number(cfg.logoSizeMm || 28)));
        const logoH = Math.max(10, logoW * 0.72);
        doc.addImage(cfg.logoDataUrl, imageFormat, (ticketWidth / 2) - (logoW / 2), y, logoW, logoH);
        y += logoH + Math.max(2.5, Number(cfg.logoTitleGapMm || 8) * 0.45);
      } catch {}
    }

    doc.setFont(String(cfg.titleFont || 'helvetica'), cfg.titleBold ? 'bold' : 'normal');
    doc.setFontSize(Math.max(10, Number(cfg.titleSizePt || 12)));
    doc.text(String(state.settings?.title1 || cfg.title || 'RECIBO'), ticketWidth / 2, y, { align: 'center', maxWidth: contentWidth });
    y += 6;

    const dt = new Date(data.createdAt || Date.now());
    y = writeLine('No Recibo:', orderNumberLabel(data.orderNumber), y, { step: 4.2 });
    y = writeLine('Fecha:', dt.toLocaleDateString(), y, { step: 4.2 });
    y = writeLine('Hora:', dt.toLocaleTimeString(), y, { step: 4.2 });
    y = writeLine('Usuario:', data.user || '-', y, { step: 4.5 });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, ticketWidth - margin, y);
    y += 1.5;

    const itemRows = (data.items || []).map((it) => [
      String(it.name || ''),
      String(it.qty || 0),
      `${symbol} ${Number(it.unit || 0).toFixed(2)}`,
      `${symbol} ${Number(it.lineTotal || 0).toFixed(2)}`
    ]);
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Producto', 'Cant', 'PU', 'PT']],
      body: itemRows,
      styles: { fontSize: 8.3, cellPadding: 1.2, overflow: 'linebreak' },
      headStyles: { fontStyle: 'bold', lineWidth: 0.1, lineColor: [190, 190, 190] },
      theme: 'plain',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 10 }, 2: { halign: 'right', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 20 } }
    });
    y = (doc.lastAutoTable?.finalY || y) + 2;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, ticketWidth - margin, y);
    y += 4;

    y = writeLine('Cantidad artículos:', String(Number(data.totalItems || 0)), y);
    y = writeLine('Subtotal:', `${symbol} ${Number(data.subtotal || 0).toFixed(2)}`, y);
    if (Number(data.discount || 0) > 0) {
      y = writeLine('Descuento:', `${symbol} ${Number(data.discount || 0).toFixed(2)}`, y);
      y = writeLine('TOTAL:', `${symbol} ${Number(data.total || 0).toFixed(2)}`, y, { bold: true, size: 10, step: 5 });
    } else {
      y = writeLine('TOTAL:', `${symbol} ${Number(data.total || 0).toFixed(2)}`, y, { bold: true, size: 10, step: 5 });
    }

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, ticketWidth - margin, y);
    y += 4;

    const paymentRows = invoicePaymentRows(sale, symbol);
    for (const [k, v] of paymentRows) y = writeLine(k, v, y, { size: 8.8, step: 4.2 });

    if (cfg.message1 || cfg.message2) {
      doc.setLineDashPattern([1, 1], 0);
      doc.line(margin, y, ticketWidth - margin, y);
      y += 5;
    }

    if (cfg.message1) {
      doc.setFont(String(cfg.message1Font || 'helvetica'), cfg.message1Bold ? 'bold' : 'normal');
      doc.setFontSize(Math.max(7, Number(cfg.message1SizePt || 9)));
      doc.text(String(cfg.message1), ticketWidth / 2, y, { align: 'center', maxWidth: contentWidth });
      y += 5;
    }
    if (cfg.message2) {
      doc.setFont(String(cfg.message2Font || 'helvetica'), cfg.message2Bold ? 'bold' : 'normal');
      doc.setFontSize(Math.max(7, Number(cfg.message2SizePt || 9)));
      doc.text(String(cfg.message2), ticketWidth / 2, y, { align: 'center', maxWidth: contentWidth });
      y += 5;
    }

    const requiredHeight = Math.max(ticketHeight, y + margin + 8);
    if (requiredHeight > doc.internal.pageSize.getHeight() && doc.internal?.pageSize?.setHeight) {
      doc.internal.pageSize.setHeight(requiredHeight);
    }

    const blobUrl = doc.output('bloburl');
    if (options.autoPrint) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setMsg(homeMessage, 'Bloqueador de ventanas activo. Permite popups para ver e imprimir la factura.', false);
      } else {
        printWindow.document.open();
        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Factura</title><style>html,body{margin:0;height:100%;background:#202020;}iframe{border:0;width:100%;height:100%;}</style></head><body><iframe id="pdfFrame" src="${blobUrl}"></iframe><script>const frame=document.getElementById('pdfFrame');const trigger=()=>setTimeout(()=>{try{window.focus();window.print();}catch(e){}},450);if(frame){frame.addEventListener('load', trigger);setTimeout(trigger,900);}else{setTimeout(trigger,900);}<'+'/'+'script></body></html>`);
        printWindow.document.close();
      }
    } else {
      const win = window.open(blobUrl, '_blank');
      if (!win) setMsg(homeMessage, 'Bloqueador de ventanas activo. Permite popups para ver la factura.', false);
    }
    setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch {} }, 180000);
    const elapsedMs = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - startedAt);
    console.info('[invoice] PDF listo en', elapsedMs, 'ms', { items: (data.items || []).length, autoPrint: Boolean(options.autoPrint) });
  } catch (err) {
    console.error('[invoice] open pdf', err);
    setMsg(homeMessage, 'No se pudo generar la factura PDF.', false);
  }
}


function renderSalesHistory() {
  if (!salesTable) return;
  const userFilter = salesUserFilter?.value || '';
  const users = ['<option value="">Todos los usuarios</option>'].concat(state.users.map((u) => `<option value="${u.username}">${u.username}</option>`));
  if (salesUserFilter) {
    const prev = salesUserFilter.value;
    salesUserFilter.innerHTML = users.join('');
    salesUserFilter.value = prev;
  }
  const validSales = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt).map((sale) => ({ ...sale, saleStatus: 'OK', saleStatusClass: '' }));
  console.info('[sale][history] render historial', { activeCashBoxId: state.activeCashBoxId || '', validSalesCount: validSales.length, deletedSalesCount: (state.deletedSales || []).length });
  const deletedSales = (state.deletedSales || []).filter((sale) => !state.activeCashBoxId || sale.cashBoxId === state.activeCashBoxId).map((sale) => ({ ...sale, saleStatus: 'ANULADA', saleStatusClass: 'sale-annulled' }));
  let list = [...validSales, ...deletedSales].slice();
  const searchOrder = (salesOrderSearchInput?.value || '').trim();
  if (userFilter) list = list.filter((s) => s.user === userFilter);
  if (searchOrder) list = list.filter((s) => String(s.orderNumber || '').includes(searchOrder));
  list.sort((a, b) => new Date(b.createdAt || b.deletedAt || 0) - new Date(a.createdAt || a.deletedAt || 0));
  salesTable.innerHTML = list.length ? list.map((sale) => {
    const isAnnulled = sale.saleStatus === 'ANULADA';
    const actions = isAnnulled
      ? `<span class="muted">Venta anulada${sale.deletedBy ? ` · eliminado por ${sale.deletedBy}` : ''}</span>`
      : `<button type="button" class="secondary" data-sale-act="view" data-sale-id="${sale.id}">Ver Venta</button> <button type="button" class="secondary" data-sale-act="invoice" data-sale-id="${sale.id}">Ver factura</button>${hasPermission('deleteSales') ? ` <button type="button" class="secondary" data-sale-act="edit" data-sale-id="${sale.id}">Editar venta</button> <button type="button" class="secondary" data-sale-act="del" data-sale-id="${sale.id}">Eliminar venta</button>` : ''}`;
    return `<tr style="${isAnnulled ? 'color:#c1121f;font-weight:700;' : ''}"><td>#${orderNumberLabel(sale.orderNumber)}</td><td>${new Date(sale.createdAt || sale.deletedAt).toLocaleString()}</td><td>${money(sale.total)}</td><td>${sale.payment}</td><td style="${isAnnulled ? 'color:#c1121f;font-weight:700;' : ''}">${sale.saleStatus}</td><td>${actions}</td><td>${sale.user}</td></tr>`;
  }).join('') : '<tr><td colspan="7">Sin ventas.</td></tr>';
}


function renderDeletedSales() {
  if (!deletedSalesTable) return;
  const from = deletedSalesFromDate?.value || '';
  const to = deletedSalesToDate?.value || '';
  let list = (state.deletedSales || []).filter((s) => !state.activeCashBoxId || s.cashBoxId === state.activeCashBoxId);
  if (from) list = list.filter((s) => (s.deletedAt || s.createdAt || '').slice(0, 10) >= from);
  if (to) list = list.filter((s) => (s.deletedAt || s.createdAt || '').slice(0, 10) <= to);
  deletedSalesTable.innerHTML = list.length
    ? list.map((s) => `<tr><td>#${orderNumberLabel(s.orderNumber)}</td><td>${new Date(s.deletedAt || s.createdAt).toLocaleString()}</td><td>${s.items?.map((i) => `${i.name} x${i.qty}`).join(', ') || '-'}</td><td>${money(s.total)}</td><td>${s.deletedBy || '-'}</td></tr>`).join('')
    : '<tr><td colspan="5">Sin ventas eliminadas.</td></tr>';
}

function renderProductSalesReport() {
  if (!productSalesReportTable) return;
  const list = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt).slice();
  const map = new Map();
  list.forEach((sale) => {
    sale.items?.forEach((it) => {
      if (!map.has(it.name)) map.set(it.name, { qty: 0, total: 0 });
      const row = map.get(it.name);
      row.qty += Number(it.qty || 0);
      row.total += Number(it.finalSubtotal ?? (it.price * it.qty));
    });
  });
  if (productSalesReportRange) productSalesReportRange.textContent = 'Rango: Todo el historial de la caja activa';
  productSalesReportTable.innerHTML = [...map.entries()].length
    ? [...map.entries()].map(([name, v]) => `<tr><td>${name}</td><td>${v.qty}</td><td>${money(v.total)}</td></tr>`).join('')
    : '<tr><td colspan="3">Sin datos para el rango seleccionado.</td></tr>';
}

function openSaleEditModal(sale) {
  document.getElementById('editSaleOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'editSaleOverlay';
  overlay.className = 'modal';
  const productOptions = state.products.filter((p) => !p.hidden).map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  overlay.innerHTML = `<div class="modal-card"><h3>Editar venta #${orderNumberLabel(sale.orderNumber)}</h3><label>Método de pago<select id="editSalePayment"><option value="efectivo">Efectivo</option><option value="qr">QR</option><option value="mixto">Mixto</option><option value="deuda">Por pagar</option><option value="medio_pago">Medio pago</option></select></label><div class="grid2"><label>Producto adicional<select id="editSaleProduct"><option value="">Ninguno</option>${productOptions}</select></label><label>Cantidad<input id="editSaleQty" type="number" min="1" value="1" /></label></div><div class="grid2"><button id="saveEditSaleBtn" class="primary" type="button">Actualizar</button><button id="cancelEditSaleBtn" class="secondary" type="button">Atrás</button></div></div>`;
  document.body.appendChild(overlay);
  const pay = document.getElementById('editSalePayment');
  if (pay) pay.value = sale.payment;
  document.getElementById('cancelEditSaleBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('saveEditSaleBtn')?.addEventListener('click', () => {
    if (!hasPermission('deleteSales')) { alert('No tienes permiso para editar ventas.'); return; }
    sale.payment = document.getElementById('editSalePayment')?.value || sale.payment;
    const pid = document.getElementById('editSaleProduct')?.value || '';
    const qty = Math.max(1, Number(document.getElementById('editSaleQty')?.value || 1));
    if (pid) {
      const p = state.products.find((x) => x.id === pid);
      if (p) {
        if (isStockEnabled() && Number(p.stockCurrent || 0) < qty) { alert('Stock insuficiente para agregar producto.'); return; }
        if (isStockEnabled() && Array.isArray(p.combo) && p.combo.length) {
          const req = comboComponentRequirements(p, qty);
          const missing = [...req.entries()].find(([componentId, neededQty]) => {
            const component = state.products.find((x) => x.id === componentId);
            return Number(component?.stockCurrent || 0) < Number(neededQty || 0);
          });
          if (missing) {
            const component = state.products.find((x) => x.id === missing[0]);
            alert(`Stock insuficiente para componente del combo: ${component?.name || 'Componente'}.`);
            return;
          }
        }
        if (isStockEnabled()) p.stockCurrent = Number(p.stockCurrent || 0) - qty;
        if (isStockEnabled() && Array.isArray(p.combo) && p.combo.length) {
          const req = comboComponentRequirements(p, qty);
          req.forEach((neededQty, componentId) => {
            const component = state.products.find((x) => x.id === componentId);
            if (component) component.stockCurrent = Number(component.stockCurrent || 0) - Number(neededQty || 0);
          });
        }
        sale.items.push({ id: p.id, name: p.name, qty, price: p.price, discountPct: 0, finalSubtotal: p.price * qty });
      }
    }
    sale.total = sale.items.reduce((a, i) => a + Number(i.finalSubtotal ?? (i.price * i.qty)), 0);
    persist();
    renderSalesHistory();
  renderDeletedSales();
  renderDebtPayments();
    renderSummary();
  renderSoldProductsList();
    overlay.remove();
  });
}


function openDebtPaymentModal({ saleIds = [], debtorId = '' } = {}) {
  document.getElementById('debtPayOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'debtPayOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Realizar pago</h3><div class="grid3"><label>Método<select id="dpMethod"><option value="efectivo">Efectivo</option><option value="qr">QR</option><option value="mixto">Mixto</option></select></label><label id="dpCashWrap" class="hidden">Efectivo<input id="dpCash" type="number" min="0" step="0.01" value="0" /></label><label id="dpQrWrap" class="hidden">QR<input id="dpQr" type="text" readonly value="Bs 0.00" /></label></div><div class="grid2"><button id="dpPayBtn" class="primary" type="button">Finalizar</button><button id="dpBackBtn" class="secondary" type="button">Atrás</button></div></div>`;
  document.body.appendChild(overlay);
  const getTargetSales = () => saleIds.length ? state.sales.filter((s) => saleIds.includes(s.id)) : state.sales.filter((s) => s.debtorId === debtorId && Number(s.debtAmount || 0) > 0);
  const totalDebt = () => getTargetSales().reduce((a, s) => a + Number(s.debtAmount || 0), 0);
  const methodEl = document.getElementById('dpMethod');
  const cashEl = document.getElementById('dpCash');
  const qrEl = document.getElementById('dpQr');
  const cashWrap = document.getElementById('dpCashWrap');
  const qrWrap = document.getElementById('dpQrWrap');
  const sync = () => {
    const mixed = methodEl?.value === 'mixto';
    cashWrap?.classList.toggle('hidden', !mixed);
    qrWrap?.classList.toggle('hidden', !mixed);
    if (mixed && qrEl) qrEl.value = money(Math.max(0, totalDebt() - Number(cashEl?.value || 0)));
  };
  methodEl?.addEventListener('change', sync);
  cashEl?.addEventListener('input', sync);
  sync();
  document.getElementById('dpBackBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('dpPayBtn')?.addEventListener('click', () => {
    console.info('[debt][pay-start]', { saleIds, debtorId });
    const method = methodEl?.value || 'efectivo';
    const targets = getTargetSales().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const activeCash = getActiveCashBox();
    const hasActiveCash = Boolean(activeCash);
    const totalDebtAmount = targets.reduce((a, s) => a + Number(s.debtAmount || 0), 0);
    let remainingCashMixed = method === 'mixto' ? Math.max(0, Math.min(totalDebtAmount, Number(cashEl?.value || 0))) : 0;
    targets.forEach((sale) => {
      const amount = Number(sale.debtAmount || 0);
      if (amount <= 0) return;
      let cashPaid = 0;
      let qrPaid = 0;
      if (method === 'efectivo') cashPaid = amount;
      if (method === 'qr') qrPaid = amount;
      if (method === 'mixto') {
        cashPaid = Math.min(amount, remainingCashMixed);
        qrPaid = amount - cashPaid;
        remainingCashMixed -= cashPaid;
      }
      sale.debtAmount = 0;
      sale.paymentStatus = 'realizado';
      sale.modifiedAt = Date.now();
      state.debtPayments.unshift({
        id: uid(),
        paidAt: new Date().toISOString(),
        saleCreatedAt: sale.createdAt,
        debtorId: sale.debtorId,
        saleId: sale.id,
        method,
        amount,
        cashAmount: cashPaid,
        qrAmount: qrPaid,
        cashBoxId: hasActiveCash ? activeCash.id : '',
        paidBy: state.currentUser?.username || '-',
        archivado: false,
        anulado: false,
        anuladoPorVentaId: ''
      });
    });
    persist({ module: 'sale' });
    console.info('[debt][persist]', { debtPaymentsCount: state.debtPayments?.length || 0 });
    renderDebtors();
    renderSummary();
  renderSoldProductsList();
    renderDebtPayments();
    Promise.resolve().then(() => syncToCloud()).then(() => console.info('[debt][sync] ok')).catch((err) => console.error('[debt][sync] error', err));
    Promise.resolve().then(() => pullFromCloud({ force: true })).then(() => console.info('[debt][pull] ok')).catch(() => {});
    overlay.remove();
  });
}


function activeDebtPayments() {
  return (state.debtPayments || []).filter((p) => !p?.anulado);
}

function annulDebtPaymentsBySaleId(saleId = '', actor = '') {
  if (!saleId) return 0;
  let count = 0;
  (state.debtPayments || []).forEach((pay) => {
    if (!pay || pay.saleId !== saleId || pay.anulado) return;
    pay.anulado = true;
    pay.anuladoPorVentaId = saleId;
    pay.anuladoAt = new Date().toISOString();
    pay.anuladoBy = actor || state.currentUser?.username || '-';
    count += 1;
  });
  return count;
}

function saleRecordForPayment(payment) {
  if (!payment?.saleId) return null;
  return state.sales.find((x) => x.id === payment.saleId) || state.deletedSales.find((x) => x.id === payment.saleId) || null;
}

function renderDebtPayments() {
  if (!debtPaymentsTable) return;
  console.info('[debt][render]', { mode: state.debtPaymentsView || 'history', paymentsCount: state.debtPayments?.length || 0 });
  state.debtPaymentsView = state.debtPaymentsView || 'history';
  state.activeDebtorPaymentsId = state.activeDebtorPaymentsId || '';
  if (debtPaymentsHistoryCard && !document.getElementById('debtPaymentsNav')) {
    const nav = document.createElement('div');
    nav.id = 'debtPaymentsNav';
    nav.className = 'grid3';
    nav.innerHTML = '<button id="debtViewHistoryBtn" class="secondary" type="button">Historial de pagos</button><button id="debtViewByDebtorBtn" class="secondary" type="button">Pago por deudores</button><button id="debtViewArchivedBtn" class="secondary" type="button">Archivados</button>';
    debtPaymentsHistoryCard.insertBefore(nav, debtPaymentsHistoryCard.firstChild);
    document.getElementById('debtViewHistoryBtn')?.addEventListener('click', () => { state.debtPaymentsView = 'history'; state.activeDebtorPaymentsId = ''; renderDebtPayments(); });
    document.getElementById('debtViewByDebtorBtn')?.addEventListener('click', () => { state.debtPaymentsView = 'byDebtor'; state.activeDebtorPaymentsId = ''; renderDebtPayments(); });
    document.getElementById('debtViewArchivedBtn')?.addEventListener('click', () => { state.debtPaymentsView = 'archived'; state.activeDebtorPaymentsId = ''; renderDebtPayments(); });
  }
  const debtPaymentsHead = debtPaymentsTable.closest('table')?.querySelector('thead tr');

  const from = debtPaymentsFromDate?.value || '';
  const to = debtPaymentsToDate?.value || '';
  let list = state.debtPayments.slice().sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));
  const activeList = list.filter((p) => !p.archivado && !p.anulado);
  const archivedList = list.filter((p) => p.archivado);
  if (from) list = list.filter((p) => (p.paidAt || '').slice(0, 10) >= from);
  if (to) list = list.filter((p) => (p.paidAt || '').slice(0, 10) <= to);

  if (state.debtPaymentsView === 'archived') {
    if (debtPaymentsHead) debtPaymentsHead.innerHTML = '<th>Deudor</th><th>Fecha pago</th><th>Detalle compra</th><th>Total pagado</th><th>Usuario</th><th>Estado</th>';
    const filtered = archivedList.filter((p) => (!from || (p.paidAt || '').slice(0, 10) >= from) && (!to || (p.paidAt || '').slice(0, 10) <= to));
    debtPaymentsTable.innerHTML = filtered.length ? filtered.map((p) => {
      const sale = saleRecordForPayment(p);
      const person = state.people.find((x) => x.id === p.debtorId);
      return `<tr><td>${personFullName(person) || '-'}</td><td>${new Date(p.paidAt).toLocaleString()}</td><td>${sale?.items?.map((i) => `${i.name} x${i.qty}`).join(', ') || '-'}</td><td>${money(p.amount)}</td><td>${p.paidBy || '-'}</td><td>${p.anulado ? 'ANULADO' : 'Archivado'}</td></tr>`;
    }).join('') : '<tr><td colspan="6">Sin pagos archivados.</td></tr>';
    return;
  }

  if (state.debtPaymentsView === 'byDebtor' && !state.activeDebtorPaymentsId) {
    if (debtPaymentsHead) debtPaymentsHead.innerHTML = '<th>Deudor</th><th>Total pagado</th><th>Registros</th><th>Acción</th>';
    const grouped = new Map();
    activeList.forEach((p) => {
      const k = p.debtorId || '-';
      if (!grouped.has(k)) grouped.set(k, []);
      grouped.get(k).push(p);
    });
    debtPaymentsTable.innerHTML = [...grouped.entries()].length ? [...grouped.entries()].map(([debtorId, items]) => {
      const person = state.people.find((x) => x.id === debtorId);
      const total = items.reduce((a, x) => a + Number(x.amount || 0), 0);
      return `<tr><td>${personFullName(person) || 'Sin nombre'}</td><td>${money(total)}</td><td>${items.length}</td><td><button class="secondary" data-debtor-pay-details="${debtorId}" type="button">Ver detalles</button></td></tr>`;
    }).join('') : '<tr><td colspan="4">Sin pagos por deudores.</td></tr>';
    debtPaymentsTable.onclick = (e) => {
      const btn = e.target.closest('button[data-debtor-pay-details]');
      if (!btn) return;
      state.activeDebtorPaymentsId = btn.dataset.debtorPayDetails || '';
      renderDebtPayments();
    };
    return;
  }

  if (state.debtPaymentsView === 'byDebtor' && state.activeDebtorPaymentsId) {
    if (debtPaymentsHead) debtPaymentsHead.innerHTML = '<th>Fecha venta</th><th>Fecha pago</th><th>Detalle compra</th><th>Total pagado</th><th>Usuario cobro</th><th>Acción</th>';
    const filtered = activeList.filter((p) => p.debtorId === state.activeDebtorPaymentsId);
    debtPaymentsTable.innerHTML = filtered.length ? filtered.map((p) => {
      const sale = saleRecordForPayment(p);
      const paidBy = p.paidBy || p.user || '-';
      const saleDate = p.saleCreatedAt || sale?.createdAt || '';
      return `<tr><td>${saleDate ? new Date(saleDate).toLocaleString() : '-'}</td><td>${new Date(p.paidAt).toLocaleString()}</td><td>${sale?.items?.map((i) => `${i.name} x${i.qty}`).join(', ') || '-'}</td><td>${money(p.amount)}</td><td>${paidBy}</td><td><button class="secondary" data-archive-debt-pay="${p.id}" type="button">Archivar</button></td></tr>`;
    }).join('') : '<tr><td colspan="6">Sin pagos para este deudor.</td></tr>';
    if (debtPaymentsTable && !document.getElementById('archiveDebtorHistoryBtn')) {
      const btn = document.createElement('button');
      btn.id = 'archiveDebtorHistoryBtn';
      btn.className = 'secondary';
      btn.type = 'button';
      btn.textContent = 'Archivar historial del deudor';
      debtPaymentsTable.closest('table')?.insertAdjacentElement('beforebegin', btn);
      btn.addEventListener('click', () => {
        state.debtPayments.forEach((p) => { if (p.debtorId === state.activeDebtorPaymentsId) p.archivado = true; });
        persist();
        state.activeDebtorPaymentsId = '';
        renderDebtPayments();
      });
    }
    debtPaymentsTable.onclick = (e) => {
      const btn = e.target.closest('button[data-archive-debt-pay]');
      if (!btn) return;
      const item = state.debtPayments.find((x) => x.id === btn.dataset.archiveDebtPay);
      if (!item) return;
      item.archivado = true;
      persist();
      renderDebtPayments();
    };
    return;
  }

  document.getElementById('archiveDebtorHistoryBtn')?.remove();
  if (debtPaymentsHead) {
    debtPaymentsHead.innerHTML = '<th>Fecha de la venta</th><th>Fecha del pago</th><th>Detalle de la compra</th><th>Total pagado</th><th>Usuario que realizó el cobro</th>';
  }
  const visible = list.filter((p) => !p.archivado && !p.anulado);
  debtPaymentsTable.innerHTML = visible.length ? visible.map((p) => {
    const sale = saleRecordForPayment(p);
    const paidBy = p.paidBy || p.user || '-';
    const saleDate = p.saleCreatedAt || sale?.createdAt || '';
    return `<tr><td>${saleDate ? new Date(saleDate).toLocaleString() : '-'}</td><td>${new Date(p.paidAt).toLocaleString()}</td><td>${sale?.items?.map((i) => `${i.name} x${i.qty}`).join(', ') || '-'}</td><td>${money(p.amount)}</td><td>${paidBy}</td></tr>`;
  }).join('') : '<tr><td colspan="5">Sin pagos realizados.</td></tr>';
}


function stripHeavyDataUrl(value) {
  const raw = String(value || '');
  if (!raw.startsWith('data:image/')) return value;
  return '';
}

function sanitizeCloudPayload(payload) {
  const out = { ...payload };
  out.settings = { ...(payload.settings || {}) };
  if (out.settings.billing && typeof out.settings.billing === 'object') out.settings.billing = { ...out.settings.billing };
  out.products = (payload.products || []).map((p) => ({ ...p, imageDataUrl: stripHeavyDataUrl(p?.imageDataUrl) }));
  out.categoryImages = Object.fromEntries(Object.entries(payload.categoryImages || {}).map(([k, v]) => [k, stripHeavyDataUrl(v)]));
  console.info('[cloud][images]', {
    strippedMainLogo: false,
    strippedBillingLogo: false
  });
  return out;
}

function snapshotPayload() {
  return {
    products: state.products,
    sales: state.sales,
    deletedSales: state.deletedSales,
    cashClosings: state.cashClosings,
    cashSession: state.cashSession,
    users: state.users,
    settings: state.settings,
    categories: state.categories,
    subcategories: state.subcategories || {},
    people: state.people,
    stockConfig: state.stockConfig,
    outflows: state.outflows,
    debtPayments: state.debtPayments,
    components: state.components,
    componentLinks: state.componentLinks,
    componentMoves: state.componentMoves,
    cashBoxes: state.cashBoxes,
    activeCashBoxId: state.activeCashBoxId || '',
    systemStatus: state.systemStatus || 'CAJA_CERRADA',
    forceLogoutAt: Number(state.forceLogoutAt || 0),
    userSalesModes: state.userSalesModes || {},
    touchUiConfigByUser: state.touchUiConfigByUser || {},
    categoryImages: state.categoryImages || {},
    orderCounters: state.orderCounters || {},
    deletedRecordIds: state.deletedRecordIds || { cashClosings: [], sales: [] },
    generalCash: state.generalCash || { efectivo: 0, qr: 0, estado: 'CERRADA', openedAt: '', closedAt: '', openedBy: '', closedBy: '', updatedAt: 0 },
    generalClosings: state.generalClosings || [],
    updatedAt: Date.now()
  };
}


function mergeByIdPreferRemote(remoteList = [], localList = [], tombstones = []) {
  remoteList = normalizeCollectionToArray(remoteList);
  localList = normalizeCollectionToArray(localList);
  const map = new Map();
  const removed = new Set((tombstones || []).map((x) => String(x)));
  (remoteList || []).forEach((item) => {
    if (!item?.id) return;
    if (removed.has(String(item.id))) return;
    map.set(String(item.id), item);
  });
  (localList || []).forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (removed.has(key)) return;
    if (!map.has(key)) map.set(key, item);
  });
  return [...map.values()];
}

function mergeByIdPreferLocal(remoteList = [], localList = [], tombstones = []) {
  remoteList = normalizeCollectionToArray(remoteList);
  localList = normalizeCollectionToArray(localList);
  const map = new Map();
  const removed = new Set((tombstones || []).map((x) => String(x)));
  remoteList.forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (removed.has(key)) return;
    map.set(key, item);
  });
  localList.forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (removed.has(key)) return;
    map.set(key, item);
  });
  return [...map.values()];
}

function recordTimestamp(item = {}) {
  const modified = Number(item?.modifiedAt || 0);
  const created = Date.parse(item?.createdAt || '') || 0;
  const paid = Date.parse(item?.paidAt || '') || 0;
  return Math.max(modified, created, paid, 0);
}

function mergeByIdLatest(remoteList = [], localList = [], tombstones = []) {
  remoteList = normalizeCollectionToArray(remoteList);
  localList = normalizeCollectionToArray(localList);
  const map = new Map();
  const removed = new Set((tombstones || []).map((x) => String(x)));
  remoteList.forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (removed.has(key)) return;
    map.set(key, item);
  });
  localList.forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (removed.has(key)) return;
    const remote = map.get(key);
    if (!remote || recordTimestamp(item) >= recordTimestamp(remote)) map.set(key, item);
  });
  return [...map.values()];
}

function mergeDeletedRecordIds(remoteDeleted = {}, localDeleted = {}) {
  const keys = ['cashClosings', 'sales'];
  const out = {};
  keys.forEach((key) => {
    const remote = Array.isArray(remoteDeleted?.[key]) ? remoteDeleted[key] : [];
    const local = Array.isArray(localDeleted?.[key]) ? localDeleted[key] : [];
    out[key] = [...new Set([...remote, ...local].map((x) => String(x)).filter(Boolean))];
  });
  return out;
}

function cashBoxTimelineValue(box) {
  if (!box || typeof box !== 'object') return 0;
  return Date.parse(box.fecha_cierre || box.fecha_apertura || '') || 0;
}

function mergeCashBoxes(remoteBoxes = [], localBoxes = []) {
  const map = new Map();
  (remoteBoxes || []).forEach((box) => { if (box?.id) map.set(String(box.id), box); });
  (localBoxes || []).forEach((box) => {
    if (!box?.id) return;
    const key = String(box.id);
    const remote = map.get(key);
    if (!remote) {
      map.set(key, box);
      return;
    }
    const remoteScore = cashBoxTimelineValue(remote);
    const localScore = cashBoxTimelineValue(box);
    if (localScore > remoteScore) map.set(key, box);
    else if (localScore === remoteScore && remote.estado !== 'CERRADA' && box.estado === 'CERRADA') map.set(key, box);
  });
  return [...map.values()];
}

async function syncToCloud(options = {}) {
  if (!state.settings.firebaseDbUrl) return;
  await ensureCloudSeedData();
  console.info('[cloud][sync] inicio');
  const makeSyncError = (code, stage, status, message, extra = {}) => Object.assign(new Error(message), { code, stage, status, ...extra });
  const token = normalizedFirebaseToken();
  const authModes = token ? [true, false] : [false];
  let lastError = null;

  for (const includeToken of authModes) {
    const modeLabel = includeToken ? 'token' : 'sin-token';
    const url = buildCloudRootUrl({ includeToken });
    if (!url) continue;
    try {
      const remoteResp = await fetch(url);
      if (!remoteResp.ok) {
        const err = makeSyncError('RTDB_HTTP_GET', 'get', remoteResp.status, `[sync][rtdb] GET fallo (${remoteResp.status}) usando ${modeLabel}.`, { modeLabel });
        if (includeToken && (remoteResp.status === 401 || remoteResp.status === 403)) {
          console.warn('[sync][token] GET rechazado con token. Reintentando sin token.', { status: remoteResp.status });
          lastError = err;
          continue;
        }
        throw err;
      }
      let remoteData = null;
      try { remoteData = await remoteResp.json(); } catch { remoteData = null; }
      const remoteUpdatedAt = Number(remoteData?.updatedAt || 0);
      const rawPayload = snapshotPayload();
      const payload = sanitizeCloudPayload(rawPayload);
      console.info('[users][sync]', { usersCount: payload.users?.length || 0 });
      console.info('[settings][sync]', { title1: payload.settings?.title1 || '', hasLogo: Boolean(payload.settings?.logoDataUrl) });
      console.info('[settings][logo-sync]', { hasLogo: Boolean(payload.settings?.logoDataUrl), logoLength: String(payload.settings?.logoDataUrl || '').length });
      console.info('[sale][sync]', { salesCount: payload.sales?.length || 0, activeCashBoxId: payload.activeCashBoxId || '' });
      console.info('[cloud][payload-size]', { bytes: JSON.stringify(payload).length });
      const mergedDeleted = mergeDeletedRecordIds(remoteData?.deletedRecordIds, payload.deletedRecordIds);
      payload.deletedRecordIds = mergedDeleted;
      payload.sales = mergeByIdLatest(remoteData?.sales, payload.sales, mergedDeleted.sales);
      payload.cashClosings = mergeByIdPreferRemote(remoteData?.cashClosings, payload.cashClosings, mergedDeleted.cashClosings);
      payload.deletedSales = mergeByIdPreferRemote(remoteData?.deletedSales, payload.deletedSales);
      payload.outflows = mergeByIdLatest(remoteData?.outflows, payload.outflows);
      payload.debtPayments = mergeByIdLatest(remoteData?.debtPayments, payload.debtPayments);
      payload.cashBoxes = mergeCashBoxes(remoteData?.cashBoxes, payload.cashBoxes);
      if (!payload.activeCashBoxId && remoteData?.activeCashBoxId) payload.activeCashBoxId = remoteData.activeCashBoxId;
      if (payload.systemStatus === 'CAJA_CERRADA' && remoteData?.systemStatus === 'CAJA_ABIERTA' && payload.activeCashBoxId === remoteData.activeCashBoxId) {
        payload.systemStatus = remoteData.systemStatus;
        payload.cashSession = remoteData.cashSession || payload.cashSession;
      }
      if (remoteUpdatedAt && Number(payload.updatedAt || 0) <= remoteUpdatedAt) payload.updatedAt = remoteUpdatedAt + 1;

      const putResp = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!putResp.ok) {
        const err = makeSyncError('RTDB_HTTP_PUT', 'put', putResp.status, `[sync][rtdb] PUT fallo (${putResp.status}) usando ${modeLabel}.`, { modeLabel });
        if (includeToken && (putResp.status === 401 || putResp.status === 403)) {
          console.warn('[sync][token] PUT rechazado con token. Reintentando sin token.', { status: putResp.status });
          lastError = err;
          continue;
        }
        throw err;
      }
      state.lastSyncAt = Number(payload.updatedAt || Date.now());
      saveLocalState();
      console.info('[settings][firebase] settings escritos en payload compartido', { title1: payload.settings?.title1 || '', hasLogo: Boolean(payload.settings?.logoDataUrl) });
      if (syncStatus) syncStatus.textContent = 'Sincronización enviada.';
      if (token && !includeToken) console.info('[sync][token] Sincronización exitosa ignorando token (token innecesario o inválido).');
      console.info('[cloud][sync] fin', { updatedAt: payload.updatedAt });
      return;
    } catch (err) {
      lastError = err;
      if (syncStatus) syncStatus.textContent = 'Error de sincronización.';
      const status = Number(err?.status || 0);
      if (includeToken && (status === 401 || status === 403)) {
        console.warn('[sync][token] Fallo de autenticación con token. Reintentando sin token.', { status, message: err?.message });
        continue;
      }
      console.error('[sync][rtdb] Error en sincronización.', { modeLabel, code: err?.code, status: err?.status, stage: err?.stage, message: err?.message });
      console.error('[cloud][sync] error', { message: err?.message, code: err?.code, status: err?.status });
      break;
    }
  }
  throw lastError || new Error('sync unknown failure');
}


async function pullFromCloud(options = {}) {
  if (!state.settings.firebaseDbUrl) return;
  await ensureCloudSeedData();
  console.info('[cloud][pull] inicio', { force: Boolean(options.force) });
  const now = Date.now();
  if (!options.force && (now - lastCloudPullAt) < CLOUD_PULL_MIN_INTERVAL_MS) return;
  if (cloudPullInFlight) return cloudPullInFlight;
  cloudPullInFlight = (async () => {
  try {
    lastCloudPullAt = Date.now();
    const token = normalizedFirebaseToken();
    const rootUrls = token
      ? [buildCloudRootUrl({ includeToken: true }), buildCloudRootUrl({ includeToken: false })].filter(Boolean)
      : [buildCloudRootUrl({ includeToken: false })].filter(Boolean);
    let data = null;
    let rootUrlUsed = '';
    for (const rootUrl of rootUrls) {
      rootUrlUsed = rootUrl;
      if (!options.force) {
        const stampResp = await fetch(rootUrl.replace(/\.json(\?.*)?$/, '/updatedAt.json$1'));
        if (!stampResp.ok) {
          if (token && rootUrl.includes('?auth=') && [401, 403].includes(stampResp.status)) continue;
          throw new Error(`[pull] updatedAt no disponible (${stampResp.status})`);
        }
        const remoteStamp = Number(await stampResp.json() || 0);
        if (!remoteStamp || remoteStamp <= Number(state.lastSyncAt || 0)) return;
      }
      const r = await fetch(rootUrl);
      if (!r.ok) {
        if (token && rootUrl.includes('?auth=') && [401, 403].includes(r.status)) continue;
        throw new Error(`[pull] root no disponible (${r.status})`);
      }
    const dataRaw = await r.json();
    data = normalizeCloudSeedObject(dataRaw);
    console.info('[cloud][payload-size]', { bytes: JSON.stringify(dataRaw || {}).length, source: 'pull' });
    break;
    }
    if (!data) throw new Error('[pull] No fue posible leer RTDB con token ni sin token.');
    if (!options.force && data.updatedAt <= state.lastSyncAt) {
      return;
    }
    applyCloudData(data);
    console.info('[sale][pull]', { salesCount: Array.isArray(data.sales) ? data.sales.length : -1, activeCashBoxId: data.activeCashBoxId || '' });
    console.info('[cloud][pull] fin', { updatedAt: data.updatedAt, rootUrlUsed });
    console.info('[cloud] estado sincronizado', { activeCashBoxId: state.activeCashBoxId, systemStatus: state.systemStatus, rootUrlUsed });
    const currentRoute = normalizeRoute(window.location.hash || '#home');
    const inSettingsBranch = currentRoute === 'settings' || currentRoute.startsWith('settings/');
    const inPosBranch = currentRoute.startsWith('pos/') || currentRoute === 'cash/closings';
    if (state.currentUser && !getActiveCashBox() && !inSettingsBranch && !inPosBranch) {
      maybeForceLogoutFromClosure();
    }
    applyRoute();
  } catch (err) {
    console.error('[sync][rtdb][pull] Fallo en pullFromCloud', { code: err?.code, status: err?.status, message: err?.message });
  }
  finally {
    cloudPullInFlight = null;
  }
  })();
  return cloudPullInFlight;
}

function renderHomeActions() {
  const active = isCashOpen();
  if (goSalesBtn) goSalesBtn.classList.toggle('hidden', !active || !hasPermission('viewSalesButton'));
  if (closeCashBtn) closeCashBtn.classList.toggle('hidden', !active || !canCloseCash() || !hasPermission('viewCloseCashButton'));
  if (startCashBtn) startCashBtn.classList.toggle('hidden', active || !canOpenCash());
  if (openSettingsBtn) openSettingsBtn.classList.toggle('hidden', !hasPermission('accessSettings') || !hasPermission('viewSettingsButton'));
  if (goCashClosingsBtn) goCashClosingsBtn.classList.toggle('hidden', !hasPermission('viewClosingsTab'));
  if (goWarehouseBtn) goWarehouseBtn.classList.toggle('hidden', !hasPermission('viewWarehouseButton'));
  const goSalesModeBtn = document.getElementById('goSalesModeBtn');
  if (goSalesModeBtn) goSalesModeBtn.classList.toggle('hidden', !hasPermission('viewSalesModeButton'));
  const user = currentUserRecord();
  if (sessionInfo) sessionInfo.textContent = user ? `Usuario activo: ${user.username}` : 'Sin sesión';
  if (posSessionInfo) posSessionInfo.textContent = user ? `Usuario: ${user.username}` : 'Usuario: -';

  if (!active) {
    setMsg(homeMessage, 'La caja está cerrada. Espera a que un usuario autorizado la abra.', false);
  } else if (homeMessage?.textContent.includes('caja')) {
    setMsg(homeMessage, '');
  }
}


function renderTabsByPermissions() {
  const map = {
    productos: 'viewProductsTab',
    configVentas: 'viewConfigVentasTab',
    deudas: 'viewDebtorsTab',
    resumen: 'viewSummaryTab',
    cierres: 'viewClosingsTab'
  };
  tabs.forEach((tab) => {
    const permKey = map[tab.dataset.tab];
    if (!permKey) return;
    tab.classList.toggle('hidden', !hasPermission(permKey));
  });
}

function renderOrdersVisibility() {
  syncAppConfig();
  const enabled = Boolean(appConfig.activarPedidos) && hasPermission('viewOrders');
  const pedidosTab = document.querySelector('.tab[data-tab="pedidos"]');
  if (pedidosTab) pedidosTab.classList.toggle('hidden', !enabled);
}

function showLogin() {
  const user = currentUserRecord();
  if (state.currentUser && user && user.enabled !== false && !isSessionExpired()) {
    showHome();
    return;
  }
  loginScreen?.classList.remove('hidden');
  homeScreen?.classList.add('hidden');
  posScreen?.classList.add('hidden');
  stockScreen?.classList.add('hidden');
  warehouseScreen?.classList.add('hidden');
  if (loginUserInput) loginUserInput.value = '';
  if (loginPassInput) loginPassInput.value = '';
  setMsg(loginMessage, '');
}
function showHome() {
  console.info('[nav][render-home]');
  loginScreen?.classList.add('hidden');
  homeScreen?.classList.remove('hidden');
  posScreen?.classList.add('hidden');
  stockScreen?.classList.add('hidden');
  warehouseScreen?.classList.add('hidden');
  Array.from(homeScreen?.children || []).forEach((el) => el.classList.remove('hidden'));
  settingsCard?.classList.add('hidden');
  console.info('[nav][screen-state]', {
    loginHidden: loginScreen?.classList.contains('hidden'),
    homeHidden: homeScreen?.classList.contains('hidden'),
    posHidden: posScreen?.classList.contains('hidden'),
    settingsHidden: settingsCard?.classList.contains('hidden')
  });
  renderHomeActions();
  renderTabsByPermissions();
  renderCashStatus();
  renderCashClosings();
  renderSummary();
  renderSoldProductsList();
}
function switchToPos(tabId = 'ventas') {
  if (tabId === 'pedidos' && !appConfig.activarPedidos) return;
  if (tabId === 'ventas' && !hasPermission('viewSalesButton')) return;
  if (tabId === 'pedidos' && !hasPermission('viewOrders')) return;
  const tabPermMap = { productos: 'viewProductsTab', configVentas: 'viewConfigVentasTab', deudas: 'viewDebtorsTab', resumen: 'viewSummaryTab', cierres: 'viewClosingsTab' };
  const reqPerm = tabPermMap[tabId];
  if (reqPerm && !hasPermission(reqPerm)) return;
  if (tabId === 'ventas' && !getActiveCashBox()) return setMsg(homeMessage, 'Primero debes abrir caja para habilitar ventas.', false);
  homeScreen?.classList.add('hidden');
  posScreen?.classList.remove('hidden');
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
  panels.forEach((p) => p.classList.toggle('active', p.id === tabId));
  if (tabId === 'cierres') renderCashClosings();
}

async function handleLogin() {
  const username = loginUserInput?.value?.trim() || '';
  const password = loginPassInput?.value?.trim() || '';
  if (!username || !password) return setMsg(loginMessage, 'Ingresa usuario y contraseña para continuar.', false);
  let cloudReadyAtLogin = false;
  try {
    await pullFromCloud({ force: true });
    cloudReadyAtLogin = true;
  } catch {}
  ensureUsers();
  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) return setMsg(loginMessage, 'Usuario o contraseña incorrectos.', false);
  if (user.enabled === false) return setMsg(loginMessage, 'Usuario inhabilitado por administrador.', false);
  const now = Date.now();
  user.lastActivityAt = now;
  state.currentUser = { username: user.username, loginAt: now, lastActivityAt: now };
  saveLocalState();
  beginSessionWatcher();
  if (loginUserInput) loginUserInput.value = '';
  if (loginPassInput) loginPassInput.value = '';
  setMsg(loginMessage, '');
  markUserActivity('login');
  persist();
  cloudHydrated = cloudHydrated || cloudReadyAtLogin;
  if (!cloudHydrated) {
    console.error('[login] Sesión iniciada sin hidratación cloud. Se bloquearán operaciones compartidas hasta reconexión.', saleDebugContext());
  }
  startFirebaseRealtimeListener();
  maybeForceLogoutFromClosure();
  if (!state.currentUser) return;
  renderOrdersVisibility();
  renderHomeActions();
  showHome();
  renderSalesHistory();
  if (!getActiveCashBox()) setMsg(homeMessage, 'La caja está cerrada. Espera a que un usuario autorizado la abra.', false);
}

function logout(message = '') {
  const u = currentUserRecord();
  if (u) u.lastLogoutAt = Date.now();
  state.currentUser = null;
  persist();
  showLogin();
  if (message) setMsg(loginMessage, message, false);
}

function maybeForceLogoutFromClosure() {
  if (!state.currentUser) return;
  if (getActiveCashBox()) return;
  showHome();
  setMsg(homeMessage, 'La caja ha sido cerrada.', false);
}

function closeStartCashModal() {
  document.getElementById('startCashModalOverlay')?.remove();
}

function openStartCashModal() {
  console.info('[cash] click Abrir Caja');
  if (!canOpenCash()) {
    console.warn('[cash] usuario sin permisos para abrir caja');
    setMsg(homeMessage, 'No tienes permiso para abrir caja.', false);
    return;
  }
  if (getActiveCashBox()) {
    console.warn('[cash] bloqueado: ya existe caja abierta', state.activeCashBoxId);
    setMsg(homeMessage, 'Ya existe una caja abierta.', false);
    return;
  }
  closeStartCashModal();
  const overlay = document.createElement('div');
  overlay.id = 'startCashModalOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Abrir caja</h3><p>Ingresa el monto inicial de caja.</p><div class="grid2"><label>Monto inicial<input id="startCashOpeningInput" type="number" min="0" step="0.01" placeholder="0.00" /></label></div><div class="grid2"><button id="startCashConfirmBtn" class="primary" type="button">Confirmar apertura</button><button id="startCashCancelBtn" class="secondary" type="button">Cancelar</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('startCashCancelBtn')?.addEventListener('click', closeStartCashModal);
  document.getElementById('startCashConfirmBtn')?.addEventListener('click', () => {
    const openingAmount = Math.max(0, Number(document.getElementById('startCashOpeningInput')?.value || 0));
    console.info('[cash] confirmar apertura', { openingAmount });
    startCashSession(openingAmount);
  });
}

async function startCashSession(openingAmount = 0) {
  console.info('[cash] startCashSession()', { openingAmount, user: state.currentUser?.username || '-' });
  if (!canOpenCash()) {
    console.warn('[cash] bloqueo por permisos');
    return setMsg(homeMessage, 'No tienes permiso para abrir caja.', false);
  }
  if (getActiveCashBox()) {
    console.warn('[cash] bloqueo porque ya hay caja abierta', state.activeCashBoxId);
    return setMsg(homeMessage, 'Ya existe una caja abierta.', false);
  }

  const parsedOpening = Number(openingAmount || 0);
  if (Number.isNaN(parsedOpening) || parsedOpening < 0) {
    console.error('[cash] monto inicial inválido', openingAmount);
    return setMsg(homeMessage, 'Monto inicial inválido.', false);
  }

  const nowIso = new Date().toISOString();
  const cashBox = {
    id: uid(),
    fecha_apertura: nowIso,
    usuario_apertura: state.currentUser?.username || '-',
    openingCash: parsedOpening,
    estado: 'ABIERTA',
    fecha_cierre: null,
    resumen: null,
    usuario_cierre: null
  };

  state.cashBoxes.unshift(cashBox);
  state.activeCashBoxId = cashBox.id;
  state.systemStatus = 'CAJA_ABIERTA';
  state.cashSession = { id: cashBox.id, openedAt: cashBox.fecha_apertura, openingCash: parsedOpening, orderCounter: 1 };

  closeStartCashModal();
  startCashCard?.classList.add('hidden');
  persist();
  renderHomeActions();
  renderTabsByPermissions();
  renderCashStatus();
  renderSummary();
  renderSoldProductsList();
  renderOrders(false);
  renderSalesHistory();
  renderDebtors();
  renderOutflows();
  console.info('[cash] caja abierta correctamente', { cashBoxId: cashBox.id });
  setMsg(homeMessage, 'Caja abierta correctamente.');
  switchToPos('ventas');
}

async function closeCashSession() {
  if (!state.currentUser || !currentUserRecord()) {
    return setMsg(homeMessage, 'Sesión inválida. Vuelve a iniciar sesión.', false);
  }
  if (!canCloseCash()) return setMsg(homeMessage, 'No tienes permiso para cerrar caja.', false);
  try {
    const activeCash = getActiveCashBox();
    if (!activeCash) return setMsg(homeMessage, 'No hay caja abierta para cerrar.', false);
    if (!confirm('¿Estás seguro que deseas cerrar caja?')) return;

    const daySales = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt);
    const dayOutflows = (state.outflows || []).filter((move) => move.cashBoxId === state.activeCashBoxId);
    const dayDebtPayments = activeDebtPayments().filter((pay) => pay.cashBoxId === state.activeCashBoxId);
    const dayDeletedSales = (state.deletedSales || []).filter((sale) => sale.cashBoxId === state.activeCashBoxId);

    const totalsByMethod = daySales.reduce((acc, sale) => {
      const method = sale.payment || 'desconocido';
      acc[method] = (acc[method] || 0) + Number(sale.total || 0);
      return acc;
    }, {});

    const cashIn = daySales.reduce((sum, sale) => sum + Number(sale.breakdown?.cash || 0), 0);
    const qrIn = daySales.reduce((sum, sale) => sum + Number(sale.breakdown?.qr || 0), 0);
    const debtPendingTotal = daySales.reduce((sum, sale) => sum + Number(sale.debtAmount || 0), 0);

    activeCash.estado = 'CERRADA';
    activeCash.fecha_cierre = new Date().toISOString();
    activeCash.resumen = {
      total_ventas: daySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      total_transacciones: daySales.length,
      total_pedidos: daySales.length,
      total_por_metodo: totalsByMethod
    };
    activeCash.usuario_cierre = state.currentUser?.username || '-';

    const closing = {
      id: uid(),
      cashBoxId: activeCash.id,
      openedAt: activeCash.fecha_apertura,
      closedAt: activeCash.fecha_cierre,
      openingCash: Number(activeCash.openingCash || 0),
      cashIn,
      qrIn,
      debtPending: debtPendingTotal,
      finalCashInBox: Number(activeCash.openingCash || 0) + cashIn,
      salesCount: daySales.length,
      salesIds: daySales.map((sale) => sale.id),
      salesSnapshot: daySales.map((sale) => ({ ...sale })),
      deletedSalesSnapshot: dayDeletedSales.map((sale) => ({ ...sale })),
      outflowsSnapshot: dayOutflows.map((move) => ({ ...move })),
      debtPaymentsSnapshot: dayDebtPayments.map((pay) => ({ ...pay }))
    };
    state.cashClosings.unshift(closing);

    state.activeCashBoxId = '';
    state.systemStatus = 'CAJA_CERRADA';
    state.cashSession = null;
    state.forceLogoutAt = Date.now();
    persist();

    renderHomeActions();
    renderTabsByPermissions();
    renderOrders(false);
    refreshFinancialViews();
    if (cashCloseResult) {
      cashCloseResult.className = 'ok';
      cashCloseResult.textContent = `Cierre digital realizado: Ventas ${money(activeCash.resumen.total_ventas)} · Transacciones ${activeCash.resumen.total_transacciones}.`;
    }
    switchToPos('ventas');
    showHome();
    Promise.resolve(syncToCloud()).catch((err) => console.error('[cash] sync close failed', err));
    setMsg(homeMessage, 'La caja ha sido cerrada.', false);
  } catch (err) {
    console.error('[cash] closeCashSession error', err);
    setMsg(homeMessage, 'No se pudo cerrar caja. Intenta nuevamente.', false);
  }
}

async function registerSale() {
  await ensureCloudSeedData();
  if (isSubmittingSale) return;
  isSubmittingSale = true;
  if (createSaleBtn) createSaleBtn.disabled = true;
  touchSessionActivity();
  try {
  console.info('[sale][init-check]', { cloudHydrated, bootCloudReady, bootListenerReady, bootCashReady, activeCashBoxId: state.activeCashBoxId || '' });
  if ((state.sales || []).length < 2) console.info('[sale][first-run]', { salesCount: (state.sales || []).length });
  if (!cloudHydrated || !bootCloudReady) {
    await pullFromCloud({ force: true });
    bootCloudReady = true;
    cloudHydrated = true;
  }
  if (!bootListenerReady) startFirebaseRealtimeListener();
  if (!state.currentUser) return setMsg(saleMessage, 'fallo porque currentUser es inválido', false);
  if (!cloudHydrated) return setMsg(saleMessage, 'fallo porque el cliente no está hidratado desde cloud', false);
  const activeCash = getActiveCashBox();
  if (!activeCash) return setMsg(saleMessage, 'fallo porque no existe caja activa compartida', false);
  if (!state.currentCart.length) return setMsg(saleMessage, 'Añade productos antes de generar la venta.', false);
  const totals = saleTotals();
  const payment = paymentType?.value || 'efectivo';
  let breakdown = { cash: 0, qr: 0 };
  let debtAmount = 0;
  let debtorId = '';
  if (payment === 'efectivo') {
    const paid = Number(cashPaidInput?.value || 0);
    if (!cashPaidInput?.value) return setMsg(saleMessage, 'Debes ingresar \"Cliente paga\" para efectivo.', false);
    if (paid < totals.final) return setMsg(saleMessage, 'El monto de cliente paga no cubre el total.', false);
    breakdown = { cash: totals.final, qr: 0, paid };
  }
  if (payment === 'qr') breakdown = { cash: 0, qr: totals.final };
  if (payment === 'mixto') {
    const cash = Math.max(0, Number(cashAmount?.value || 0));
    breakdown = { cash, qr: Math.max(0, totals.final - cash) };
  }
  if (payment === 'deuda') {
    debtorId = debtorSelect?.value || '';
    if (!debtorId) return setMsg(saleMessage, 'Selecciona una persona para registrar la deuda.', false);
    debtAmount = totals.final;
  }
  if (payment === 'medio_pago') {
    debtorId = partialPersonSelect?.value || '';
    if (!debtorId) return setMsg(saleMessage, 'Selecciona una persona para registrar el medio pago.', false);
    const paid = Math.max(0, Number(partialPaidAmount?.value || 0));
    const method = partialMethod?.value || 'efectivo';
    if (method === 'efectivo') breakdown.cash = paid;
    else breakdown.qr = paid;
    debtAmount = Math.max(0, totals.final - paid);
  }
  if (isStockEnabled()) {
    for (const item of state.currentCart) {
      const p = state.products.find((x) => x.id === item.id);
      if (!p) continue;
      if (Number(p.stockCurrent || 0) < Number(item.qty || 0)) return setMsg(saleMessage, `Stock insuficiente para ${item.name}.`, false);
      if (Array.isArray(p.combo) && p.combo.length) {
        const req = comboComponentRequirements(p, item.qty);
        const missing = [...req.entries()].find(([componentId, neededQty]) => {
          const component = state.products.find((x) => x.id === componentId);
          return Number(component?.stockCurrent || 0) < Number(neededQty || 0);
        });
        if (missing) {
          const component = state.products.find((x) => x.id === missing[0]);
          return setMsg(saleMessage, `Stock insuficiente para componente del combo: ${component?.name || 'Componente'}.`, false);
        }
      }
    }
  }
  const deliveryItems = [];
  state.currentCart.forEach((item) => { for (let i = 0; i < item.qty; i += 1) deliveryItems.push({ name: formatProductWithComboText(item), delivered: false, deliveredBy: '' }); });
  const activeCashBoxId = activeCash.id;
  let orderNumber = 0;
  try {
    orderNumber = await reserveNextOrderNumber(activeCashBoxId);
    console.info('[sale][order-number]', { orderNumber, activeCashBoxId });
  } catch (err) {
    console.error('[sale] fallo al reservar correlativo', { message: err?.message, code: err?.code, status: err?.status, context: saleDebugContext({ activeCashBoxId }) });
    return setMsg(saleMessage, 'fallo al reservar correlativo', false);
  }
  const sale = { id: uid(), cashBoxId: activeCashBoxId, orderNumber, createdAt: new Date().toISOString(), modifiedAt: Date.now(), user: state.currentUser.username, items: state.currentCart.map((i) => ({ ...i })), total: totals.final, payment, breakdown, debtAmount, debtorId, paymentStatus: debtAmount > 0 ? 'pendiente' : 'realizado', orderStatus: 'pendiente', deliveryItems, carryOverDebt: false };
  console.info('[sale][create] Venta generada', saleDebugContext({ saleId: sale.id, sale, orderCounters: state.orderCounters }));
  sale.invoiceSnapshot = buildInvoiceData(sale);
  if (isStockEnabled()) {
    for (const item of state.currentCart) {
      const p = state.products.find((x) => x.id === item.id);
      if (!p) continue;
      const next = Number(p.stockCurrent || 0) - Number(item.qty || 0);
      p.stockCurrent = next;
      console.info('[sale][stock]', { saleId: sale.id, productId: p.id, stockCurrent: next });
      if (next <= Number(appConfig.stockMinimo || 0)) console.warn('[stock] Producto con stock mínimo', p.name, next);
      if (Array.isArray(p.combo) && p.combo.length) {
        const req = comboComponentRequirements(p, item.qty);
        req.forEach((neededQty, componentId) => {
          const component = state.products.find((x) => x.id === componentId);
          if (!component) return;
          const cNext = Number(component.stockCurrent || 0) - Number(neededQty || 0);
          component.stockCurrent = cNext;
          if (cNext <= Number(appConfig.stockMinimo || 0)) console.warn('[stock] Producto con stock mínimo', component.name, cNext);
        });
      }
    }
  }
  applyWarehouseImpactFromSaleItems(sale.items, { reverse: false, saleId: `#${orderNumberLabel(sale.orderNumber)}` });
  state.sales.unshift(sale);
  state.currentCart = [];
  persist({ sync: false, module: 'sale' });
  let confirmed = false;
  try {
    console.info('[sale][before-commit]', { saleId: sale.id, orderNumber: sale.orderNumber, cashBoxId: sale.cashBoxId, activeCashBoxId: state.activeCashBoxId || '', user: sale.user, payment: sale.payment, total: sale.total, inStateSales: state.sales.some((x) => x.id === sale.id) });
    await commitSaleToFirebaseTransaction(sale);
    confirmed = true;
    Promise.resolve().then(() => pullFromCloud({ force: true })).catch(() => {});
    Promise.resolve().then(() => syncToCloud({ attempt: 0 })).catch((err) => console.warn('[sale][sync] post-confirm full sync warning', err));
  } catch (err) {
    if (String(err?.code || '').startsWith('RTDB_HTTP_')) console.error('[sale][sync][rtdb] fallo al confirmar venta en RTDB', { error: err, context: saleDebugContext({ saleId: sale.id }) });
    else console.error('[sale][sync] fallo al confirmar venta en RTDB', { error: err, context: saleDebugContext({ saleId: sale.id }) });
  }
  if (!confirmed) {
    console.error('[sale][rollback]', { saleId: sale.id, orderNumber: sale.orderNumber });
    state.sales = state.sales.filter((x) => x.id !== sale.id);
    persist({ sync: false, module: 'sale' });
    return setMsg(saleMessage, 'No se pudo confirmar la venta en la nube. Intenta nuevamente.', false);
  }
  setTimeout(() => {
    const exists = (state.sales || []).some((x) => x.id === sale.id);
    if (!exists) console.error('[sale][lost-detection]', { saleId: sale.id, orderNumber: sale.orderNumber, activeCashBoxId: state.activeCashBoxId || '' });
  }, 1200);
  renderCart();
  renderOrders(false);
  setMsg(saleMessage, 'Venta registrada correctamente.');
  refreshFinancialViews();
  const billCfg = billingSettings();
  if (billCfg.enabled) {
    Promise.resolve(openSaleInvoiceWindow(sale, { autoPrint: Boolean(billCfg.autoPrintEnabled) })).catch((err) => {
      console.error('[invoice] auto-open after sale failed', err);
    });
  }
  renderWarehouse();
  if (saleSuccessTitle) saleSuccessTitle.textContent = `Venta realizada exitosamente · Pedido #${orderNumberLabel(sale.orderNumber)}`;
  saleProceedReady = false;
  saleSuccessModal?.classList.remove('hidden');
  syncSaleSubmitVisibility();
  } finally {
    isSubmittingSale = false;
    if (createSaleBtn) createSaleBtn.disabled = false;
    syncSaleSubmitVisibility();
  }
}

function hideSaleSuccessModal() { saleSuccessModal?.classList.add('hidden'); saleFormContainer?.classList.add('hidden'); state.currentCart = []; saleProceedReady = false; activeSaleCategory=''; if (paymentType) paymentType.value='efectivo'; cashPaymentFields?.classList.remove('hidden'); if (cashPaidInput) cashPaidInput.value=''; mixedFields?.classList.add('hidden'); debtFields?.classList.add('hidden'); partialFields?.classList.add('hidden'); renderCart(); renderSaleSelectors(); syncSaleSubmitVisibility(); }

function syncSaleSubmitVisibility() {
  if (!createSaleBtn) return;
  const isTouch = currentSalesMode() === 'touch';
  let proceedBtn = document.getElementById('proceedPaymentBtn');
  if (!isTouch) {
    if (!proceedBtn) {
      proceedBtn = document.createElement('button');
      proceedBtn.id = 'proceedPaymentBtn';
      proceedBtn.type = 'button';
      proceedBtn.className = 'secondary';
      proceedBtn.textContent = 'Proceder con el pago';
      createSaleBtn.insertAdjacentElement('beforebegin', proceedBtn);
      proceedBtn.addEventListener('click', () => {
        if (!state.currentCart?.length) return setMsg(saleMessage, 'Añade productos antes de proceder con el pago.', false);
        saleProceedReady = true;
        const paymentCard = paymentType?.closest('.card');
        paymentCard?.classList.remove('hidden');
        paymentType?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        syncSaleSubmitVisibility();
      });
    }
    proceedBtn.disabled = !state.currentCart?.length || !saleFormContainer || saleFormContainer.classList.contains('hidden');
    proceedBtn.classList.toggle('hidden', !saleFormContainer || saleFormContainer.classList.contains('hidden'));
  } else if (proceedBtn) {
    proceedBtn.remove();
    proceedBtn = null;
  }
  const visibleInForm = saleFormContainer && !saleFormContainer.classList.contains('hidden');
  createSaleBtn.classList.toggle('hidden', !visibleInForm || !saleProceedReady);
  createSaleBtn.disabled = !state.currentCart?.length || isSubmittingSale;
}

function ensureQueuedOrderButtons() {
  if (!saleFormContainer || document.getElementById('queueSaleBtn')) return;
  const createBtn = document.getElementById('createSale');
  if (!createBtn) return;
  const wrap = document.createElement('div');
  wrap.id = 'queuedOrderActions';
  wrap.className = 'grid3';
  wrap.innerHTML = '<button id="queueSaleBtn" class="secondary" type="button">Añadir a la cola</button><button id="viewQueuedOrdersBtn" class="secondary" type="button">Ver pedidos pendientes</button>';
  createBtn.insertAdjacentElement('afterend', wrap);
  document.getElementById('queueSaleBtn')?.addEventListener('click', queueCurrentSaleDraft);
  document.getElementById('viewQueuedOrdersBtn')?.addEventListener('click', openQueuedOrdersModal);
}

function queueCurrentSaleDraft() {
  if (!state.currentCart?.length) return setMsg(saleMessage, 'No hay productos para guardar en cola.', false);
  state.queuedOrders = Array.isArray(state.queuedOrders) ? state.queuedOrders : [];
  state.queuedOrders.unshift({
    id: uid(),
    createdAt: new Date().toISOString(),
    items: state.currentCart.map((i) => ({ ...i }))
  });
  state.currentCart = [];
  persist();
  renderCart();
  setMsg(saleMessage, 'Pedido enviado a la cola correctamente.');
}

function openQueuedOrdersModal() {
  document.getElementById('queuedOrdersOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'queuedOrdersOverlay';
  overlay.className = 'modal';
  const rows = (state.queuedOrders || []).map((q) => `<tr><td>${q.items.map((i) => `${i.name} x${i.qty}`).join(', ') || '-'}</td><td><button class="secondary" data-queue-resume="${q.id}" type="button">Retomar pedido</button> <button class="danger" data-queue-del="${q.id}" type="button">Eliminar pedido</button></td></tr>`).join('') || '<tr><td colspan="2">Sin pedidos en cola.</td></tr>';
  overlay.innerHTML = `<div class="modal-card"><h3>Pedidos pendientes</h3><table><thead><tr><th>Lista</th><th>Acción</th></tr></thead><tbody id="queuedOrdersTable">${rows}</tbody></table><button id="closeQueuedOrdersBtn" class="secondary" type="button">Cerrar</button></div>`;
  document.body.appendChild(overlay);
  document.getElementById('closeQueuedOrdersBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('queuedOrdersTable')?.addEventListener('click', (e) => {
    const resume = e.target.closest('button[data-queue-resume]');
    if (resume) {
      const q = (state.queuedOrders || []).find((x) => x.id === resume.dataset.queueResume);
      if (!q) return;
      state.currentCart = (q.items || []).map((i) => ({ ...i }));
      state.queuedOrders = (state.queuedOrders || []).filter((x) => x.id !== q.id);
      persist();
      renderCart();
      renderSaleSelectors();
      overlay.remove();
      return;
    }
    const del = e.target.closest('button[data-queue-del]');
    if (!del) return;
    state.queuedOrders = (state.queuedOrders || []).filter((x) => x.id !== del.dataset.queueDel);
    persist();
    openQueuedOrdersModal();
  });
}

function renderStockPage() {
  if (!stockPageTable) return;
  if (stockPageProductSelect) stockPageProductSelect.innerHTML = (state.products || []).map((p) => `<option value=\"${p.id}\">${p.name}</option>`).join('');
  stockPageTable.innerHTML = (state.products || []).map((p) => `<tr><td>${p.name}</td><td>${Number(p.stockCurrent || 0)}</td><td><button class="secondary" data-stock-clear="${p.id}" type="button">Vaciar stock</button></td></tr>`).join('');
}

function showStockPage() {
  syncAppConfig();
  if (!appConfig.stockActivo) {
    if (stockPageStatus) stockPageStatus.textContent = 'El módulo de stock está desactivado';
    showHome();
    setMsg(homeMessage, 'El módulo de stock está desactivado', false);
    return;
  }
  homeScreen?.classList.add('hidden');
  posScreen?.classList.add('hidden');
  loginScreen?.classList.add('hidden');
  stockScreen?.classList.remove('hidden');
  if (stockPageStatus) stockPageStatus.textContent = `Stock activo · mínimo ${appConfig.stockMinimo}`;
  renderStockPage();
}

function showWarehousePage() {
  if (!hasPermission('viewWarehouseButton')) {
    showHome();
    setMsg(homeMessage, 'No tienes permiso para acceder al módulo Almacén.', false);
    return;
  }
  homeScreen?.classList.add('hidden');
  posScreen?.classList.add('hidden');
  loginScreen?.classList.add('hidden');
  stockScreen?.classList.add('hidden');
  warehouseScreen?.classList.remove('hidden');
  if (warehouseStatus) warehouseStatus.textContent = 'Gestión de componentes y recetas.';
  renderWarehouse();
}

function openSettings() {
  if (!hasPermission('accessSettings')) return setMsg(homeMessage, 'No tienes permiso para configuración.', false);
  settingsCard?.classList.remove('hidden');
}

function showSettingsView(view) {
  mainConfigCard?.classList.add('hidden');
  userManagerCard?.classList.add('hidden');
  databaseConfigCard?.classList.add('hidden');
  salesConfigCard?.classList.add('hidden');
  billingConfigCard?.classList.add('hidden');
  settingsMenuCard?.classList.add('hidden');
  view?.classList.remove('hidden');
}

function permissionSchema() {
  return [
    { key: 'viewSalesButton', label: 'Puede ver botón Venta' },
    { key: 'viewProductsTab', label: 'Puede ver botón Productos' },
    { key: 'viewSettingsButton', label: 'Puede ver botón Configuración' },
    { key: 'viewCloseCashButton', label: 'Puede ver botón Cerrar caja' },
    { key: 'viewConfigVentasTab', label: 'Puede ver botón Configuración de venta' },
    { key: 'viewDebtorsTab', label: 'Puede ver botón Personas deudoras' },
    { key: 'viewSummaryTab', label: 'Puede ver botón Total ventas diarias' },
    { key: 'viewOrders', label: 'Puede ver botón Pedidos' },
    { key: 'viewClosingsTab', label: 'Puede ver botón Cierre de caja' },
    { key: 'viewWarehouseButton', label: 'Puede ver botón Almacén' },
    { key: 'viewSalesModeButton', label: 'Puede ver el botón Modo de ventas' },
    { key: 'deleteSales', label: 'Puede eliminar ventas' },
    { key: 'openCash', label: 'Puede abrir caja' },
    { key: 'closeCash', label: 'Puede cerrar caja' },
    { key: 'manageProducts', label: 'Puede modificar productos' },
    { key: 'manageUsers', label: 'Puede gestionar usuarios' },
    { key: 'accessSettings', label: 'Puede acceder a configuración' },
    { key: 'deleteClosings', label: 'Puede eliminar cierres de caja' },
    { key: 'deleteCashMovements', label: 'Puede eliminar mov. de caja' },
    { key: 'clearDeletedSalesHistory', label: 'Puede vaciar ventas eliminadas' }
  ];
}

function permissionInputIds() {
  return permissionSchema().map((p) => `perm_${p.key}`);
}

function ensurePermissionsChecklist() {
  const host = userFormCard?.querySelector('.grid2');
  if (!host) return;
  host.classList.remove('grid2');
  host.classList.add('settings-list');
  host.innerHTML = permissionSchema().map((p) => `<label>${p.label}<input type="checkbox" id="perm_${p.key}" /></label>`).join('');
}

function openUserFormView(user = null) {
  if (!userFormCard) return;
  userFormCard.classList.remove('hidden');
  usersTable?.closest('table')?.classList.add('hidden');
  toggleUserFormBtn?.classList.add('hidden');
  backFromUsersConfigBtn?.classList.add('hidden');
  if (newUserNameInput) {
    newUserNameInput.value = user?.username || '';
    newUserNameInput.disabled = Boolean(user);
  }
  if (newUserPassInput) newUserPassInput.value = user?.password || '';
  ensurePermissionsChecklist();
  permissionSchema().forEach((perm) => {
    const el = document.getElementById(`perm_${perm.key}`);
    if (!el) return;
    el.checked = user ? Boolean(user.permissions?.[perm.key]) : false;
  });
  if (createUserBtn) createUserBtn.dataset.editUser = user?.username || '';
  if (createUserBtn) createUserBtn.textContent = user ? 'Guardar cambios' : 'Crear usuario';
}

function closeUserFormView() {
  userFormCard?.classList.add('hidden');
  usersTable?.closest('table')?.classList.remove('hidden');
  toggleUserFormBtn?.classList.remove('hidden');
  backFromUsersConfigBtn?.classList.remove('hidden');
  if (newUserNameInput) { newUserNameInput.disabled = false; newUserNameInput.value = ''; }
  if (newUserPassInput) newUserPassInput.value = '';
  if (createUserBtn) { createUserBtn.dataset.editUser = ''; createUserBtn.textContent = 'Crear usuario'; }
}

let navStack = ['home'];
let applyingRoute = false;
let activeClosingDetailId = '';

function normalizeRoute(routeLike) {
  const raw = String(routeLike || '').replace(/^#/, '') || 'home';
  return raw;
}

function parentRoute(route) {
  if (route === 'home') return 'home';
  if (route === 'settings') return 'home';
  if (route in { 'settings/main':1, 'settings/sales':1, 'settings/billing':1, 'settings/users':1, 'settings/users/activity':1, 'stock':1, 'warehouse':1, 'warehouse/gestion':1, 'warehouse/movimientos':1, 'warehouse/movimientos/archivados':1, 'pos/ventas':1, 'pos/pedidos':1, 'pos/configVentas':1, 'pos/deudas':1, 'pos/resumen':1, 'cash/closings':1, 'sales-mode':1 }) return route.startsWith('settings/') ? 'settings' : 'home';
  if (route.startsWith('settings/users/edit/') || route === 'settings/users/new') return 'settings/users';
  if (route === 'settings/users/activity') return 'settings/users';
  if (route.startsWith('warehouse/movimientos/archivados/')) return 'warehouse/movimientos/archivados';
  if (route === 'pos/productos') return 'settings';
  if (route in { 'pos/productos-lista':1, 'pos/productos-categorias':1, 'pos/productos-combo':1 }) return 'pos/productos';
  if (route in { 'pos/historial':1, 'pos/eliminadas':1, 'pos/salidas':1 }) return 'pos/configVentas';
  return 'home';
}

function ensureGlobalNavButtons() {
  let navWrap = document.getElementById('globalTopNavigation');
  if (!navWrap) {
    navWrap = document.createElement('div');
    navWrap.id = 'globalTopNavigation';
    navWrap.className = 'top-navigation hidden';
    navWrap.innerHTML = '<button id="globalBackBtn" class="secondary" type="button">Volver atrás</button><button id="globalHomeBtn" class="secondary" type="button">Volver a inicio</button>';
    document.body.appendChild(navWrap);
  }
  const backBtn = navWrap.querySelector('#globalBackBtn');
  const homeBtn = navWrap.querySelector('#globalHomeBtn');
  backBtn.onclick = () => {
    const current = normalizeRoute(window.location.hash || '#home');
    if (current === 'home') return;
    console.info('[nav][go-back]', { current, target: parentRoute(current) });
    navigateTo(parentRoute(current), { replace: true });
  };
  homeBtn.onclick = () => {
    console.info('[nav][go-home]');
    navStack = ['home'];
    navigateTo('home', { replace: true });
  };
  const showNav = Boolean(state.currentUser);
  navWrap.classList.toggle('hidden', !showNav);
  document.body.classList.toggle('with-top-navigation', showNav);
  return { navWrap, backBtn, homeBtn };
}

function showOnlyHomeSections(selectorList = []) {
  const direct = Array.from(homeScreen?.children || []);
  direct.forEach((el) => el.classList.add('hidden'));
  selectorList.forEach((sel) => document.querySelector(sel)?.classList.remove('hidden'));
}

function hideAllScreens() {
  loginScreen?.classList.add('hidden');
  homeScreen?.classList.add('hidden');
  posScreen?.classList.add('hidden');
  stockScreen?.classList.add('hidden');
  warehouseScreen?.classList.add('hidden');
  homeScreen?.classList.remove('settings-mode');
}

function enforceSingleActiveView(route = normalizeRoute(window.location.hash || '#home')) {
  const activeScreens = [loginScreen, homeScreen, posScreen, stockScreen, warehouseScreen].filter((el) => el && !el.classList.contains('hidden'));
  if (activeScreens.length > 1) {
    console.warn('[nav] múltiples vistas activas detectadas, corrigiendo', activeScreens.map((el) => el.id));
    hideAllScreens();
    if (route === 'home') homeScreen?.classList.remove('hidden');
    else if (route === 'stock') stockScreen?.classList.remove('hidden');
    else if (route === 'warehouse' || route.startsWith('warehouse/')) warehouseScreen?.classList.remove('hidden');
    else if (route.startsWith('pos/') || route === 'cash/closings') posScreen?.classList.remove('hidden');
    else if (route.startsWith('settings')) {
      homeScreen?.classList.remove('hidden');
      homeScreen?.classList.add('settings-mode');
      settingsCard?.classList.remove('hidden');
    } else loginScreen?.classList.remove('hidden');
  }
}

function ensureSettingsNavButtons() {
  const old = settingsCard?.querySelector('#settingsLocalNav');
  old?.remove();
  ensureGlobalNavButtons();
}

function renderRoute(route) {
  console.info('[nav][route-change]', { route });
  if (!state.currentUser) return showLogin();
  if (route === 'home') { showHome(); enforceSingleActiveView(route); return; }
  if (route === 'stock') { showStockPage(); enforceSingleActiveView(route); return; }
  if (route === 'warehouse' || route === 'warehouse/gestion' || route === 'warehouse/movimientos' || route === 'warehouse/movimientos/archivados' || route.startsWith('warehouse/movimientos/archivados/')) { showWarehousePage(); enforceSingleActiveView(route); return; }
  if (route === 'settings') {
    console.info('[nav][render-settings]');
    hideAllScreens();
    homeScreen?.classList.remove('hidden');
    homeScreen?.classList.add('settings-mode');
    showOnlyHomeSections(['#settingsCard']);
    settingsCard?.classList.remove('hidden');
    ensureSettingsNavButtons();
    showSettingsMenu();
    enforceSingleActiveView(route);
    return;
  }
  if (route === 'settings/main') { renderRoute('settings'); showSettingsView(mainConfigCard); enforceSingleActiveView(route); return; }
  if (route === 'settings/sales') { renderRoute('settings'); syncTempConfigFromApp(); showSettingsView(salesConfigCard); enforceSingleActiveView(route); return; }
  if (route === 'settings/billing') { renderRoute('settings'); showSettingsView(billingConfigCard); applySettings(); enforceSingleActiveView(route); return; }
  if (route === 'settings/users') { renderRoute('settings'); renderUsers(); showSettingsView(userManagerCard); closeUserFormView(); enforceSingleActiveView(route); return; }
  if (route === 'settings/users/activity') { renderRoute('settings/users'); renderUsersActivityView(); enforceSingleActiveView(route); return; }
  if (route === 'settings/users/new') { renderRoute('settings/users'); openUserFormView(); enforceSingleActiveView(route); return; }
  if (route.startsWith('settings/users/edit/')) {
    renderRoute('settings/users');
    const u = decodeURIComponent(route.split('settings/users/edit/')[1] || '');
    const user = state.users.find((x) => x.username === u);
    if (user) openUserFormView(user);
    enforceSingleActiveView(route);
    return;
  }
  if (route === 'sales-mode') { if (!hasPermission('viewSalesModeButton')) { setMsg(homeMessage, 'No tienes permiso para Modo de ventas.', false); showHome(); return; } showHome(); openSalesModeScreen(); return; }
  if (route === 'cash/closings') { switchToPos('cierres'); return; }
  if (route === 'pos/ventas') { switchToPos('ventas'); return; }
  if (route === 'pos/pedidos') { switchToPos('pedidos'); return; }
  if (route === 'pos/configVentas') { switchToPos('configVentas'); return; }
  if (route === 'pos/deudas') { switchToPos('deudas'); return; }
  if (route === 'pos/resumen') { switchToPos('resumen'); return; }
  if (route === 'pos/historial') { switchToPos('historial'); return; }
  if (route === 'pos/eliminadas') { switchToPos('eliminadas'); return; }
  if (route === 'pos/salidas') { switchToPos('salidas'); return; }
  if (route === 'pos/productos') { switchToPos('productos'); hideProductSubviews(); return; }
  if (route === 'pos/productos-lista') { switchToPos('productos'); openProductListView(); return; }
  if (route === 'pos/productos-categorias') { switchToPos('productos'); hideProductSubviews(); manageCategoriesCard?.classList.remove('hidden'); return; }
  if (route === 'pos/productos-combo') { switchToPos('productos'); hideProductSubviews(); createComboCard?.classList.remove('hidden'); if (createComboBtn) createComboBtn.classList.add('hidden'); if (comboProductsSelect) comboProductsSelect.classList.add('hidden'); openComboCreatorModal(); enforceSingleActiveView(route); return; }
  showHome();
  enforceSingleActiveView(route);
}

function applyRoute() {
  const route = normalizeRoute(window.location.hash);
  console.info('[nav][route-change]', { route, source: 'applyRoute' });
  if (!state.currentUser) return showLogin();
  ensureGlobalNavButtons();
  if (!applyingRoute) {
    const current = navStack[navStack.length - 1] || 'home';
    if (current !== route) navStack.push(route);
  }
  renderRoute(route);
  enforceSingleActiveView(route);
}

function navigateTo(route, opts = {}) {
  const next = normalizeRoute(route);
  console.info('[nav][route-change]', { route: next, source: 'navigateTo', replace: Boolean(opts.replace) });
  if (state.currentUser && next !== 'home' && !validateSessionPolicy({ silent: false })) return;
  ensureGlobalNavButtons();
  const current = navStack[navStack.length - 1] || 'home';
  if (opts.replace) {
    const parent = parentRoute(current);
    navStack[navStack.length - 1] = parent === next ? parent : next;
  } else if (current !== next) {
    navStack.push(next);
  }
  applyingRoute = true;
  window.location.hash = `#${next}`;
  applyingRoute = false;
  renderRoute(next);
  enforceSingleActiveView(next);
}

function showSettingsMenu() {
  mainConfigCard?.classList.add('hidden');
  userManagerCard?.classList.add('hidden');
  databaseConfigCard?.classList.add('hidden');
  salesConfigCard?.classList.add('hidden');
  billingConfigCard?.classList.add('hidden');
  settingsMenuCard?.classList.remove('hidden');
}

async function flushConfigChanges(successMsg) {
  console.info('[settings][persist] flushConfigChanges', { successMsg });
  persist({ module: 'settings' });
  applySettings();
  renderOrdersVisibility();
  try {
    console.info('[settings][sync] sincronizando settings a cloud');
    await syncToCloud();
  } catch (err) {
    console.warn('[config] sync warning', err);
  }
  if (successMsg) setMsg(homeMessage, successMsg);
}

async function saveMainSettings() {
  if (!hasPermission('accessSettings')) return setMsg(homeMessage, 'No tienes permiso para configurar pantalla principal.', false);
  console.info('[settings][save] Guardando configuración principal (inicio)');
  state.settings.title1 = title1Input?.value?.trim() || 'Mi Cafetería';
  state.settings.title2 = title2Input?.value?.trim() || 'Pantalla principal';
  state.settings.posTitle = posTitleInput?.value?.trim() || 'POS Cafetería';
  state.settings.posSubtitle = posSubtitleInput?.value?.trim() || 'Ventas, productos, deudas, cierres y resumen diario.';
  state.settings.logoSize = Math.max(60, Number(logoSizeInput?.value || 120));
  state.settings.posLogoSize = Math.max(30, Number(posLogoSizeInput?.value || 56));
  state.settings.title1Size = Math.max(14, Number(title1SizeInput?.value || 32));
  state.settings.title2Size = Math.max(12, Number(title2SizeInput?.value || 16));
  state.settings.title1Font = title1FontInput?.value || 'Inter, system-ui, sans-serif';
  state.settings.title2Font = title2FontInput?.value || 'Inter, system-ui, sans-serif';
  state.settings.title1Color = title1ColorInput?.value || '#1d2530';
  state.settings.title2Color = title2ColorInput?.value || '#6f7a86';
  state.settings.accentColor = accentColorInput?.value || '#1f7a5c';
  state.settings.bgColor = bgColorInput?.value || '#f7f7fb';
  state.settings.cardColor = cardColorInput?.value || '#ffffff';
  console.info('[settings][save] state.settings actualizado', { title1: state.settings.title1, title2: state.settings.title2, hasLogo: Boolean(state.settings.logoDataUrl) });
  syncAppConfig();
  const file = logoInput?.files?.[0];
  if (!file) {
    console.info('[settings][logo-save]', { action: 'no-new-file', hasLogo: Boolean(state.settings.logoDataUrl) });
    return flushConfigChanges('Configuración guardada.');
  }
  console.info('[settings][logo-load]', { fileName: file.name, size: file.size });
  const reader = new FileReader();
  reader.onload = async () => {
    state.settings.logoDataUrl = String(reader.result || '');
    console.info('[settings][logo-save]', { action: 'loaded', length: state.settings.logoDataUrl.length });
    await flushConfigChanges('Configuración guardada.');
    if (logoInput) logoInput.value = '';
  };
  reader.readAsDataURL(file);
}

async function saveSalesConfigSettings() {
  if (!hasPermission('accessSettings')) return setMsg(homeMessage, 'No tienes permiso para configurar ventas.', false);
  state.settings.ordersEnabled = Boolean(tempConfig.activarPedidos);
  state.stockConfig.enabled = Boolean(tempConfig.stockActivo);
  state.stockConfig.min = Math.max(0, Number(stockMinInput?.value || 0));
  syncAppConfig();
  await flushConfigChanges('Configuración de ventas guardada.');
  if (salesConfigStatus) salesConfigStatus.textContent = `Stock: ${appConfig.stockActivo ? 'ACTIVO' : 'INACTIVO'} · Pedidos: ${appConfig.activarPedidos ? 'ACTIVO' : 'INACTIVO'}`;
}



async function saveBillingSettings() {
  if (!hasPermission('accessSettings')) return setMsg(homeMessage, 'No tienes permiso para facturación.', false);
  console.info('[billing][save]', { hasCurrentLogo: Boolean(state.settings?.billing?.logoDataUrl) });
  const billing = normalizeBillingSettings();
  billing.enabled = Boolean(billingEnabledInput?.checked);
  billing.title = String(billingTitleInput?.value || billing.title || 'CAFETERIA SH82').trim() || 'CAFETERIA SH82';
  billing.currencySymbol = String(billingCurrencyInput?.value || billing.currencySymbol || 'Bs').trim() || 'Bs';
  billing.paperWidthMm = Math.max(58, Math.min(120, Number(billingPaperWidthInput?.value || billing.paperWidthMm || 80)));
  billing.marginMm = Math.max(0, Math.min(20, Number(billingMarginInput?.value || billing.marginMm || 4)));
  billing.message1 = String(billingMessage1Input?.value || '').trim();
  billing.message2 = String(billingMessage2Input?.value || '').trim();
  billing.logoSizeMm = Math.max(12, Math.min(60, Number(billingLogoSizeInput?.value || billing.logoSizeMm || 28)));
  billing.titleSizePt = Math.max(9, Math.min(24, Number(billingTitleSizeInput?.value || billing.titleSizePt || 12)));
  billing.titleBold = Boolean(billingTitleBoldInput?.checked);
  billing.titleFont = String(billingTitleFontInput?.value || billing.titleFont || 'helvetica');
  billing.logoTitleGapMm = Math.max(2, Math.min(24, Number(billingLogoTitleGapInput?.value || billing.logoTitleGapMm || 8)));
  billing.message1SizePt = Math.max(7, Math.min(18, Number(billingMessage1SizeInput?.value || billing.message1SizePt || 9)));
  billing.message1Bold = Boolean(billingMessage1BoldInput?.checked);
  billing.message1Font = String(billingMessage1FontInput?.value || billing.message1Font || 'helvetica');
  billing.message2SizePt = Math.max(7, Math.min(18, Number(billingMessage2SizeInput?.value || billing.message2SizePt || 9)));
  billing.message2Bold = Boolean(billingMessage2BoldInput?.checked);
  billing.message2Font = String(billingMessage2FontInput?.value || billing.message2Font || 'helvetica');
  billing.autoPrintEnabled = Boolean(billingAutoPrintInput?.checked);
  const applyPersist = async () => {
    state.settings.billing = { ...billing };
    console.info('[billing][persist]', { hasLogo: Boolean(state.settings.billing.logoDataUrl) });
    persist({ module: 'settings' });
    try {
      await syncToCloud();
      console.info('[billing][sync]', { hasLogo: Boolean(state.settings.billing.logoDataUrl) });
      await pullFromCloud({ force: true });
      console.info('[billing][pull]', { hasLogo: Boolean(state.settings?.billing?.logoDataUrl) });
    } catch (err) { console.error('[billing] sync save failed', err); }
    applySettings();
    console.info('[billing][logo-render]', { hasLogo: Boolean(state.settings?.billing?.logoDataUrl) });
    if (billingConfigStatus) billingConfigStatus.textContent = 'Configuración de facturación guardada y sincronizada.';
  };
  const file = billingLogoInput?.files?.[0];
  if (!file) {
    await applyPersist();
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    billing.logoDataUrl = String(reader.result || '');
    console.info('[billing][logo-save]', { length: billing.logoDataUrl.length });
    if (billingLogoInput) billingLogoInput.value = '';
    await applyPersist();
  };
  reader.onerror = () => {
    if (billingConfigStatus) billingConfigStatus.textContent = 'No se pudo leer el logo de facturación.';
  };
  reader.readAsDataURL(file);
}

function openFinalizedOrderEditModal(orderId) {
  const sale = state.sales.find((s) => s.id === orderId);
  if (!sale) return;
  document.getElementById('editFinalOrderOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'editFinalOrderOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Modificar pedido #${orderNumberLabel(sale.orderNumber)}</h3><table><thead><tr><th>Producto</th><th>Entregado</th></tr></thead><tbody>${sale.deliveryItems.map((item, idx) => `<tr><td>${item.name}</td><td><input type="checkbox" data-undelivered="${idx}" ${item.delivered ? 'checked' : ''} /></td></tr>`).join('')}</tbody></table><div class="grid2"><button id="saveFinalOrderEditBtn" class="primary" type="button">Actualizar</button><button id="cancelFinalOrderEditBtn" class="secondary" type="button">Cancelar</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('cancelFinalOrderEditBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('saveFinalOrderEditBtn')?.addEventListener('click', () => {
    const checks = Array.from(overlay.querySelectorAll('input[data-undelivered]'));
    checks.forEach((check) => {
      const idx = Number(check.dataset.undelivered || 0);
      const item = sale.deliveryItems[idx];
      if (!item) return;
      item.delivered = Boolean(check.checked);
      if (!item.delivered) item.deliveredBy = '';
    });
    sale.orderStatus = sale.deliveryItems.every((i) => i.delivered) ? 'finalizado' : 'pendiente';
    persist();
    renderOrders(false);
    overlay.remove();
  });
}

function openComboCreatorModal() {
  if (!hasPermission('manageProducts') && !hasPermission('manageCombos')) return setMsg(homeMessage, 'No tienes permiso para crear combos.', false);
  document.getElementById('comboCreatorOverlay')?.remove();
  state.comboBuilderItems = [];
  const overlay = document.createElement('div');
  overlay.id = 'comboCreatorOverlay';
  overlay.className = 'modal combo-modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Crear combo</h3><div class="grid2"><label>Nombre del combo<input id="modalComboName" type="text" placeholder="Ej: Desayuno" /></label><label>Valor de combo<input id="modalComboPrice" type="number" min="0.01" step="0.01" placeholder="0.00" /></label></div><div class="grid4"><label>Categoría<select id="modalComboCat"></select></label><label>Producto<select id="modalComboProd"></select></label><label>Cantidad<input id="modalComboQty" type="number" min="1" step="1" value="1" /></label><button id="modalComboAddBtn" class="secondary" type="button">Añadir a combo</button></div><h4>Lista de combo</h4><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th><th>Acción</th></tr></thead><tbody id="modalComboTable"></tbody></table><p id="modalComboTotal">Total original: Bs 0.00</p><div class="grid2"><button id="modalComboDoneBtn" class="primary" type="button">Combo realizado</button><button id="modalComboCancelBtn" class="secondary" type="button">Cancelar</button></div></div>`;
  document.body.appendChild(overlay);
  const catSel = document.getElementById('modalComboCat');
  const prodSel = document.getElementById('modalComboProd');
  const table = document.getElementById('modalComboTable');
  const totalEl = document.getElementById('modalComboTotal');
  const cats = [...new Set(state.products.filter((p) => !p.hidden).map((p) => p.category))];
  if (catSel) catSel.innerHTML = cats.map((c) => `<option value="${c}">${c}</option>`).join('');
  const syncProd = () => {
    const cat = catSel?.value || cats[0] || '';
    const list = state.products.filter((p) => !p.hidden && p.category === cat);
    if (prodSel) prodSel.innerHTML = list.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  };
  catSel?.addEventListener('change', syncProd);
  syncProd();
  const rerender = () => {
    if (!table) return;
    table.innerHTML = state.comboBuilderItems.length ? state.comboBuilderItems.map((item, idx) => `<tr><td>${item.name}</td><td><input type="number" min="1" step="1" value="${item.qty}" data-mcombo-qty="${idx}" /></td><td>${money(item.price * item.qty)}</td><td><button class="secondary" data-mcombo-rm="${idx}" type="button">Quitar</button></td></tr>`).join('') : '<tr><td colspan="4">Sin productos en combo.</td></tr>';
    const total = state.comboBuilderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (totalEl) totalEl.textContent = `Total original: ${money(total)}`;
  };
  document.getElementById('modalComboAddBtn')?.addEventListener('click', () => {
    const prod = state.products.find((p) => p.id === prodSel?.value);
    const qty = Math.max(1, Number(document.getElementById('modalComboQty')?.value || 1));
    if (!prod) return;
    const ex = state.comboBuilderItems.find((x) => x.id === prod.id);
    if (ex) ex.qty += qty;
    else state.comboBuilderItems.push({ id: prod.id, name: prod.name, price: Number(prod.price || 0), qty });
    rerender();
  });
  table?.addEventListener('change', (e) => {
    const input = e.target.closest('input[data-mcombo-qty]');
    if (!input) return;
    const item = state.comboBuilderItems[Number(input.dataset.mcomboQty || 0)];
    if (!item) return;
    item.qty = Math.max(1, Number(input.value || 1));
    rerender();
  });
  table?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mcombo-rm]');
    if (!btn) return;
    state.comboBuilderItems.splice(Number(btn.dataset.mcomboRm || 0), 1);
    rerender();
  });
  document.getElementById('modalComboCancelBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('modalComboDoneBtn')?.addEventListener('click', () => {
    const name = document.getElementById('modalComboName')?.value?.trim() || '';
    const price = Number(document.getElementById('modalComboPrice')?.value || 0);
    if (!name || price <= 0 || !state.comboBuilderItems.length) { alert('Completa nombre, precio y productos del combo.'); return; }
    if (!state.categories.includes('Combos')) state.categories.push('Combos');
    const ids = state.comboBuilderItems.flatMap((x) => Array.from({ length: x.qty }).map(() => x.id));
    state.products.push({ id: uid(), category: 'Combos', name, price, hidden: false, combo: ids });
    state.comboBuilderItems = [];
    persist();
    renderProducts();
    renderSaleSelectors();
    overlay.remove();
  });
  rerender();
}

function openProductEditModal(productId) {
  const p = state.products.find((x) => x.id === productId);
  if (!p) return;
  document.getElementById('editProductOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'editProductOverlay';
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-card"><h3>Editar producto</h3><div class="grid3"><label>Categoría<select id="editProdCategory">${(state.categories || []).map((c) => `<option value="${c}">${c}</option>`).join('')}</select></label><label>Producto<input id="editProdName" type="text" value="${p.name}" /></label><label>Precio<input id="editProdPrice" type="number" min="0.01" step="0.01" value="${Number(p.price || 0).toFixed(2)}" /></label></div><div class="grid2"><button id="saveEditProdBtn" class="primary" type="button">Guardar</button><button id="cancelEditProdBtn" class="secondary" type="button">Cancelar</button></div></div>`;
  document.body.appendChild(overlay);
  const cat = document.getElementById('editProdCategory');
  if (cat) cat.value = p.category || 'Todos';
  document.getElementById('cancelEditProdBtn')?.addEventListener('click', () => overlay.remove());
  document.getElementById('saveEditProdBtn')?.addEventListener('click', () => {
    const name = document.getElementById('editProdName')?.value?.trim() || '';
    const category = document.getElementById('editProdCategory')?.value || 'Todos';
    const price = Number(document.getElementById('editProdPrice')?.value || 0);
    if (!name || price <= 0) return;
    p.name = name;
    p.category = category;
    p.price = price;
    if (!state.categories.includes(category)) state.categories.push(category);
    persist();
    renderProducts();
    renderSaleSelectors();
    overlay.remove();
  });
}

function wireEvents() {
  if (createComboBtn) createComboBtn.classList.add('hidden');
  if (comboProductsSelect) comboProductsSelect.classList.add('hidden');
  document.addEventListener('click', touchSessionActivity);
  document.addEventListener('keydown', touchSessionActivity);
  document.addEventListener('pointerdown', touchSessionActivity);

  loginBtn?.addEventListener('click', handleLogin);
  loginUserInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  loginPassInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  logoutBtn?.addEventListener('click', logout);
  posLogoutBtn?.addEventListener('click', logout);
  startCashBtn?.addEventListener('click', () => { settingsCard?.classList.add('hidden'); openStartCashModal(); });
  openNewSaleBtn?.addEventListener('click', () => {
    state.currentCart = [];
    activeSaleCategory = '';
    if (paymentType) paymentType.value = 'efectivo';
    if (cashAmount) cashAmount.value = '';
    if (partialPaidAmount) partialPaidAmount.value = '';
    if (debtorSelect) debtorSelect.value = '';
    if (partialPersonSelect) partialPersonSelect.value = '';
    saleProceedReady = false;
    saleFormContainer?.classList.remove('hidden');
    ensureQueuedOrderButtons();
    cashPaymentFields?.classList.remove('hidden');
    if (cashPaidInput) cashPaidInput.value = '';
    mixedFields?.classList.add('hidden');
    debtFields?.classList.add('hidden');
    partialFields?.classList.add('hidden');
    renderSaleSelectors();
    renderCart();
    syncSaleUiModeVisibility();
    syncSaleSubmitVisibility();
  });
  paymentType?.addEventListener('change', () => {
    const t = paymentType.value;
    cashPaymentFields?.classList.toggle('hidden', t !== 'efectivo');
    mixedFields?.classList.toggle('hidden', t !== 'mixto');
    debtFields?.classList.toggle('hidden', t !== 'deuda');
    partialFields?.classList.toggle('hidden', t !== 'medio_pago');
    renderCart();
    if (paymentType?.value) saleProceedReady = true;
    syncSaleSubmitVisibility();
  });
  cashAmount?.addEventListener('input', renderCart);
  cashPaidInput?.addEventListener('input', renderCart);
  addDebtorBtn?.addEventListener('click', () => openPersonFormModal());
  addPartialPersonBtn?.addEventListener('click', () => openPersonFormModal());
  listDebtorBtn?.addEventListener('click', openPeopleListModal);
  listPartialPersonBtn?.addEventListener('click', openPeopleListModal);
  confirmStartCash?.addEventListener('click', () => openStartCashModal());
  closeCashBtnCard?.addEventListener('click', closeCashSession);
  goSalesBtn?.addEventListener('click', () => navigateTo('pos/ventas'));
  goCashClosingsBtn?.addEventListener('click', () => navigateTo('cash/closings'));
  goWarehouseBtn?.addEventListener('click', () => navigateTo('warehouse'));
  backHomeBtn?.addEventListener('click', () => navigateTo('home', { replace: true }));
  openSettingsBtn?.addEventListener('click', () => navigateTo('settings'));
  document.getElementById('goSalesModeBtn')?.addEventListener('click', () => navigateTo('sales-mode'));
  closeSettingsScreenBtn?.addEventListener('click', () => navigateTo('home', { replace: true }));
  saveSettingsBtn?.addEventListener('click', saveMainSettings);
  openMainConfigBtn?.addEventListener('click', () => navigateTo('settings/main'));
  openUsersConfigBtn?.addEventListener('click', () => navigateTo('settings/users'));
  openSalesConfigBtn?.addEventListener('click', () => navigateTo('settings/sales'));
  openBillingConfigBtn?.addEventListener('click', () => navigateTo('settings/billing'));
  enableStockBtn?.addEventListener('click', () => { tempConfig.stockActivo = true; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Stock ACTIVADO'; });
  disableStockBtn?.addEventListener('click', () => { tempConfig.stockActivo = false; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Stock DESACTIVADO'; });
  enableOrdersBtn?.addEventListener('click', () => { tempConfig.activarPedidos = true; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Pedidos ACTIVADOS'; });
  disableOrdersBtn?.addEventListener('click', () => { tempConfig.activarPedidos = false; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Pedidos DESACTIVADOS'; });
  applySalesConfigBtn?.addEventListener('click', () => saveSalesConfigSettings());
  billingToggleActionBtn?.addEventListener('click', () => {
    if (billingEnabledInput) billingEnabledInput.checked = !billingEnabledInput.checked;
    const active = Boolean(billingEnabledInput?.checked);
    if (billingModeIndicator) billingModeIndicator.textContent = `Estado actual: ${active ? 'ACTIVADO' : 'DESACTIVADO'}`;
    if (billingToggleActionBtn) billingToggleActionBtn.textContent = active ? 'Desactivar' : 'Activar';
    renderBillingPreview();
  });
  billingAutoPrintToggleActionBtn?.addEventListener('click', () => {
    if (billingAutoPrintInput) billingAutoPrintInput.checked = !billingAutoPrintInput.checked;
    const active = Boolean(billingAutoPrintInput?.checked);
    if (billingAutoPrintIndicator) billingAutoPrintIndicator.textContent = `Estado actual: ${active ? 'ACTIVADO' : 'DESACTIVADO'}`;
    if (billingAutoPrintToggleActionBtn) billingAutoPrintToggleActionBtn.textContent = active ? 'Desactivar' : 'Activar';
    renderBillingPreview();
  });
  saveBillingConfigBtn?.addEventListener('click', async () => { await saveBillingSettings(); renderBillingPreview(); });
  [billingEnabledInput, billingTitleInput, billingCurrencyInput, billingMarginInput, billingMessage1Input, billingMessage2Input, billingLogoSizeInput, billingTitleSizeInput, billingTitleBoldInput, billingMessage1SizeInput, billingMessage1BoldInput, billingMessage2SizeInput, billingMessage2BoldInput].forEach((el) => {
    el?.addEventListener('input', renderBillingPreview);
    el?.addEventListener('change', renderBillingPreview);
  });
  removeBillingLogoBtn?.addEventListener('click', () => {
    const billing = normalizeBillingSettings();
    billing.logoDataUrl = '';
    state.settings.billing = { ...billing };
    persist();
    if (billingConfigStatus) billingConfigStatus.textContent = 'Logo de facturación eliminado.';
    applySettings();
    renderBillingPreview();
  });
  openDatabaseConfigBtn?.classList.add('hidden');
  syncNowBtn?.addEventListener('click', async () => { try { await syncToCloud(); if (syncStatus) syncStatus.textContent = 'Sincronizado con Firebase.'; } catch {} });
  backFromMainConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromUsersConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromDatabaseConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromSalesConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromBillingConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  toggleUserFormBtn?.addEventListener('click', () => navigateTo('settings/users/new'));
  backFromUserFormBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  selectAllUserPermsBtn?.addEventListener('click', () => { permissionInputIds().forEach((id) => { const el = document.getElementById(id); if (el) el.checked = true; }); });
  createUserBtn?.addEventListener('click', () => {
    const username = newUserNameInput?.value?.trim() || '';
    const password = newUserPassInput?.value?.trim() || '';
    const editingUser = createUserBtn?.dataset?.editUser || '';
    if (!username || !password) return;
    if (!editingUser && state.users.find((u) => u.username === username)) return;
    const permissions = defaultPermissions();
    permissionSchema().forEach((perm) => {
      permissions[perm.key] = Boolean(document.getElementById(`perm_${perm.key}`)?.checked);
    });
    permissions.manageCombos = permissions.manageProducts;
    permissions.editProductPrices = permissions.manageProducts;
    if (editingUser) {
      const existing = state.users.find((u) => u.username === editingUser);
      if (!existing) return;
      existing.password = password;
      existing.permissions = { ...(existing.permissions || {}), ...permissions };
    } else {
      state.users.push({ username, password, permissions, createdBy: state.currentUser?.username || 'admin' });
    }
    persist();
    renderUsers();
    closeUserFormView();
  });
  usersTable?.addEventListener('click', (e) => {
    const toggle = e.target.closest('button[data-user-toggle-enabled]');
    if (toggle) {
      const user = state.users.find((u) => u.username === toggle.dataset.userToggleEnabled);
      if (!user || user.username === 'admin') return;
      user.enabled = user.enabled === false;
      persist();
      renderUsers();
      return;
    }
    const del = e.target.closest('button[data-user-del]');
    if (del) {
      if (del.dataset.userDel === 'admin') return;
      state.users = state.users.filter((u) => u.username !== del.dataset.userDel);
      persist();
      renderUsers();
      return;
    }
    const edit = e.target.closest('button[data-user-edit]');
    if (!edit) return;
    const u = state.users.find((x) => x.username === edit.dataset.userEdit);
    if (!u) return;
    navigateTo(`settings/users/edit/${encodeURIComponent(u.username)}`);
  });
  openCreateProductBtn?.addEventListener('click', () => { navigateTo('pos/productos-lista'); setTimeout(() => { hideProductSubviews(); createProductCard?.classList.remove('hidden'); renderProducts(); }, 0); });
  openCreateProductFromListBtn?.addEventListener('click', () => { hideProductSubviews(); createProductCard?.classList.remove('hidden'); renderProducts(); });
  openManageCategoriesBtn?.addEventListener('click', () => navigateTo('pos/productos-categorias'));
  openCreateComboBtn?.addEventListener('click', () => { navigateTo('pos/productos-combo'); });
  openProductsListBtn?.addEventListener('click', () => navigateTo('pos/productos-lista'));
  backFromProductsListBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));
  openStockBtn?.addEventListener('click', () => navigateTo('stock'));
  backFromStockBtn?.addEventListener('click', () => stockCard?.classList.add('hidden'));
  addStockBtn?.addEventListener('click', addStockManually);
  importStockBtn?.addEventListener('click', () => importStockFileInput?.click());
  importStockFileInput?.addEventListener('change', (e) => { const file = e.target?.files?.[0]; importStockFromExcelFile(file); if (importStockFileInput) importStockFileInput.value = ''; });
  exportStockBtn?.addEventListener('click', exportStockToExcel);
  importProductsBtn?.addEventListener('click', () => importProductsFileInput?.click());
  importProductsFromListBtn?.addEventListener('click', () => importProductsFileInput?.click());
  importProductsFileInput?.addEventListener('change', (e) => {
    const file = e.target?.files?.[0];
    importProductsFromExcelFile(file);
    if (importProductsFileInput) importProductsFileInput.value = '';
  });
  exportProductsBtn?.addEventListener('click', exportProductsToExcel);
  exportProductsFromListBtn?.addEventListener('click', exportProductsToExcel);
  backFromCreateProductBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));
  backFromManageCategoriesBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));
  backFromCreateComboBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));
  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = productCategory?.value || '';
    const name = productName?.value?.trim() || '';
    const price = Number(productPrice?.value || 0);
    if (!category || !name || price <= 0) return;
    state.products.push({ id: uid(), category, name, price, hidden: false });
    if (productName) productName.value = '';
    if (productPrice) productPrice.value = '';
    persist();
    renderProducts();
    renderSaleSelectors();
  });
  addCategoryBtn?.addEventListener('click', () => {
    const cat = newCategoryInput?.value?.trim() || '';
    if (!cat || state.categories.includes(cat)) return;
    state.categories.push(cat);
    if (newCategoryInput) newCategoryInput.value = '';
    persist();
    renderProducts();
    renderSaleSelectors();
  });
  createComboBtn?.addEventListener('click', () => {
    const name = comboNameInput?.value?.trim() || '';
    const price = Number(comboPriceInput?.value || 0);
    const ids = state.comboBuilderItems.length ? state.comboBuilderItems.map((p) => p.id) : (state.comboDraft.length ? state.comboDraft.map((p) => p.id) : Array.from(comboProductsSelect?.selectedOptions || []).map((o) => o.value));
    if (!name || price <= 0 || !ids.length) return;
    if (!state.categories.includes('Combos')) state.categories.push('Combos');
    state.products.push({ id: uid(), category: 'Combos', name, price, hidden: false, combo: ids });
    state.comboBuilderItems = [];
    if (comboItemsTable) comboItemsTable.innerHTML = '';
    if (comboNameInput) comboNameInput.value = '';
    if (comboPriceInput) comboPriceInput.value = '';
    if (comboCalculatedTotal) comboCalculatedTotal.textContent = 'Total original: Bs 0.00';
    persist();
    renderProducts();
    renderSaleSelectors();
  });
  comboProductsSelect?.addEventListener('change', () => {
    const ids = Array.from(comboProductsSelect.selectedOptions).map((o) => o.value);
    const total = state.products.filter((p) => ids.includes(p.id)).reduce((a, p) => a + Number(p.price || 0), 0);
    if (comboCalculatedTotal) comboCalculatedTotal.textContent = money(total);
  });
  productsTable?.addEventListener('click', (e) => {
    const edit = e.target.closest('button[data-prod-edit]');
    if (edit) {
      openProductEditModal(edit.dataset.prodEdit);
      return;
    }
    const hide = e.target.closest('button[data-prod-hide]');
    if (hide) {
      const p = state.products.find((x) => x.id === hide.dataset.prodHide);
      if (!p) return;
      p.hidden = !p.hidden;
      persist();
      renderProducts();
      renderSaleSelectors();
      return;
    }
    const upImg = e.target.closest('button[data-prod-img]');
    if (upImg) {
      openImageUploadForProduct(upImg.dataset.prodImg);
      return;
    }
    const retryImg = e.target.closest('button[data-img-retry-kind="product"]');
    if (retryImg) {
      const p = state.products.find((x) => x.id === (retryImg.dataset.imgRetryKey || ''));
      const imgRef = p?.imageUrl || p?.imageDataUrl;
      if (!imgRef) return;
      forceRetryImageRef(imgRef);
      return;
    }
    const delImg = e.target.closest('button[data-prod-img-del]');
    if (delImg) {
      const p = state.products.find((x) => x.id === delImg.dataset.prodImgDel);
      if (!p) return;
      const previous = p.imageUrl || p.imageDataUrl || '';
      delete p.imageUrl;
      delete p.imageDataUrl;
      const ok = persistImageChange(() => { if (previous) p.imageUrl = previous; });
      if (!ok) return;
      renderProducts();
      renderTouchSaleUi();
      return;
    }
    const del = e.target.closest('button[data-prod-del]');
    if (!del) return;
    state.products = state.products.filter((p) => p.id !== del.dataset.prodDel);
    persist();
    renderProducts();
    renderSaleSelectors();
  });

  categoriesTable?.addEventListener('click', (e) => {
    const imgBtn = e.target.closest('button[data-cat-img]');
    if (imgBtn) { openImageUploadForCategory(imgBtn.dataset.catImg); return; }
    const retryCatImg = e.target.closest('button[data-img-retry-kind="category"]');
    if (retryCatImg) {
      const key = retryCatImg.dataset.imgRetryKey || '';
      const ref = state.categoryImages?.[key];
      if (!ref) return;
      forceRetryImageRef(ref);
      return;
    }
    const imgDelBtn = e.target.closest('button[data-cat-img-del]');
    if (imgDelBtn) { const key = imgDelBtn.dataset.catImgDel || ''; const previous = state.categoryImages[key] || ''; delete state.categoryImages[key]; const ok = persistImageChange(() => { if (previous) state.categoryImages[key] = previous; }); if (!ok) return; renderProducts(); renderTouchSaleUi(); return; }
    const b = e.target.closest('button[data-cat-del]');
    if (!b) return;
    const cat = b.dataset.catDel;
    state.categories = state.categories.filter((c) => c !== cat);
    state.products.forEach((p) => { if (p.category === cat) p.category = 'Todos'; });
    persist();
    renderProducts();
    renderSaleSelectors();
  });
  addComboItemsBtn?.addEventListener('click', () => { renderComboBuilder(); });
  goHistorialBtn?.addEventListener('click', () => navigateTo('pos/historial'));
  goEliminadasBtn?.addEventListener('click', () => navigateTo('pos/eliminadas'));
  goSalidasBtn?.addEventListener('click', () => navigateTo('pos/salidas'));
  backFromConfigVentasBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));

  addOutflowBtn?.addEventListener('click', () => {
    if (!getActiveCashBox()) return;
    const amount = Number(outflowAmount?.value || 0);
    if (amount <= 0) return;
    state.outflows.unshift({ id: uid(), cashBoxId: state.activeCashBoxId || '', createdAt: new Date().toISOString(), direction: outflowDirection?.value || 'salida', method: outflowMethod?.value || 'efectivo', description: outflowDescription?.value || '', amount, user: state.currentUser?.username || '-' });
    if (outflowAmount) outflowAmount.value = '';
    if (outflowDescription) outflowDescription.value = '';
    persist();
    refreshFinancialViews();
  });
  outflowsTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-out-del]');
    if (!b) return;
    state.outflows = state.outflows.filter((o) => o.id !== b.dataset.outDel);
    persist();
    refreshFinancialViews();
  });
  createSaleBtn?.addEventListener('click', registerSale);
  saleSuccessContinueBtn?.addEventListener('click', hideSaleSuccessModal);
  closingsMonthFilter?.addEventListener('change', renderCashClosings);
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const map = {
      ventas: 'pos/ventas',
      pedidos: 'pos/pedidos',
      productos: 'pos/productos',
      configVentas: 'pos/configVentas',
      deudas: 'pos/deudas',
      resumen: 'pos/resumen',
      cierres: 'cash/closings'
    };
    navigateTo(map[tab.dataset.tab] || `pos/${tab.dataset.tab}`);
    if (tab.dataset.tab === 'pedidos') renderOrders(false);
  }));
  cartTable?.addEventListener('change', (e) => {
    const t = e.target;
    if (!t?.dataset?.id) return;
    const item = state.currentCart.find((i) => i.id === t.dataset.id);
    if (!item) return;
    if (t.dataset.act === 'qty') {
      const requested = Math.max(1, Number(t.value || 1));
      if (isStockEnabled()) {
        const product = state.products.find((x) => x.id === item.id);
        if (requested > Number(product?.stockCurrent || 0)) {
          alert('Cantidad supera el stock disponible.');
          t.value = String(item.qty || 1);
          return;
        }
      }
      item.qty = requested;
    }
    if (t.dataset.act === 'disc') item.discountPct = Math.max(0, Math.min(100, Number(t.value || 0)));
    if (t.dataset.act === 'subtotal') item.finalSubtotal = Math.max(0, Number(t.value || 0));
    if (t.dataset.act !== 'subtotal') {
      const total = item.price * item.qty;
      item.finalSubtotal = total - (total * (item.discountPct || 0) / 100);
    }
    renderCart();
  });
  cartTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act="rm"]');
    if (!b) return;
    state.currentCart = state.currentCart.filter((i) => i.id !== b.dataset.id);
    renderCart();
  });
  searchSalesBtn?.addEventListener('click', renderSalesHistory);
  salesOrderSearchInput?.addEventListener('input', renderSalesHistory);
  clearSalesFilterBtn?.addEventListener('click', () => { if (salesUserFilter) salesUserFilter.value=''; if (salesOrderSearchInput) salesOrderSearchInput.value=''; renderSalesHistory(); });
  openProductSalesReportBtn?.addEventListener('click', () => { productSalesReportCard?.classList.remove('hidden'); renderProductSalesReport(); });
  closeProductSalesReportBtn?.addEventListener('click', () => productSalesReportCard?.classList.add('hidden'));
  searchDeletedSalesBtn?.addEventListener('click', renderDeletedSales);
  clearDeletedSalesFilterBtn?.addEventListener('click', () => { if (deletedSalesFromDate) deletedSalesFromDate.value=''; if (deletedSalesToDate) deletedSalesToDate.value=''; renderDeletedSales(); });
  clearDeletedSalesBtn?.addEventListener('click', () => { state.deletedSales = []; persist(); renderDeletedSales(); });
  salesUserFilter?.addEventListener('change', renderSalesHistory);
  salesTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-sale-id]');
    if (!b) return;
    const sale = state.sales.find((s) => s.id === b.dataset.saleId);
    if (!sale) return;
    if (b.dataset.saleAct === 'view') {
      alert(`Pedido #${orderNumberLabel(sale.orderNumber)}\nFecha: ${new Date(sale.createdAt).toLocaleString()}\nUsuario: ${sale.user}\nMétodo: ${sale.payment}\nTotal: ${money(sale.total)}\nProductos: ${sale.items.map((i) => `${i.name} x${i.qty}`).join(', ')}`);
      return;
    }
    if (b.dataset.saleAct === 'invoice') {
      openSaleInvoiceWindow(sale);
      return;
    }
    if (b.dataset.saleAct === 'edit') {
      if (!hasPermission('deleteSales')) return alert('No tienes permiso para editar ventas.');
      openSaleEditModal(sale);
      return;
    }
    if (b.dataset.saleAct === 'del') {
      if (!hasPermission('deleteSales')) return alert('No tienes permiso para eliminar ventas.');
      const annulCount = annulDebtPaymentsBySaleId(sale.id, state.currentUser?.username || '-');
      state.deletedSales.unshift({ ...sale, deletedAt: new Date().toISOString(), deletedBy: state.currentUser?.username || '-', annulledDebtPayments: annulCount });
      if (isStockEnabled()) {
        (sale.items || []).forEach((it) => {
          const p = state.products.find((x) => x.id === it.id || normalizeProductName(x.name) === normalizeProductName(it.name));
          if (p) {
            p.stockCurrent = Number(p.stockCurrent || 0) + Number(it.qty || 0);
            if (Array.isArray(p.combo) && p.combo.length) {
              const req = comboComponentRequirements(p, it.qty);
              req.forEach((neededQty, componentId) => {
                const component = state.products.find((x) => x.id === componentId);
                if (component) component.stockCurrent = Number(component.stockCurrent || 0) + Number(neededQty || 0);
              });
            }
          }
        });
      }
      applyWarehouseImpactFromSaleItems(sale.items, { reverse: true, saleId: `#${orderNumberLabel(sale.orderNumber)}` });
      state.sales = state.sales.filter((x) => x.id !== sale.id);
      state.deletedRecordIds = state.deletedRecordIds || { cashClosings: [], sales: [] };
      if (!Array.isArray(state.deletedRecordIds.sales)) state.deletedRecordIds.sales = [];
      if (!state.deletedRecordIds.sales.includes(sale.id)) state.deletedRecordIds.sales.push(sale.id);
      persist();
      refreshFinancialViews();
      renderWarehouse();
      return;
    }
  });
  searchOrdersBtn?.addEventListener('click', () => renderOrders(false));
  showFinalizedOrdersBtn?.addEventListener('click', () => renderOrders(true));
  showFinalizedOrdersOnlyBtn?.addEventListener('click', () => renderOrders(true));
  ordersTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-order-id]');
    if (!b) return;
    openOrderDetails(b.dataset.orderId);
  });
  finalizedOrdersTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-final-edit]');
    if (!b) return;
    openFinalizedOrderEditModal(b.dataset.finalEdit);
  });
  selectAllPendingBtn?.addEventListener('click', () => { document.querySelectorAll('#pendingOrderItemsTable input[type=\"checkbox\"]').forEach((c) => { c.checked = true; }); });
  updateOrderBtn?.addEventListener('click', () => {
    const sale = state.sales.find((s) => s.id === activeOrderId);
    if (!sale) return;
    const checks = Array.from(document.querySelectorAll('#pendingOrderItemsTable input[type=\"checkbox\"]:checked'));
    const pending = sale.deliveryItems.filter((i) => !i.delivered);
    checks.forEach((c) => {
      const selected = pending[Number(c.dataset.pending || 0)];
      if (!selected) return;
      const real = sale.deliveryItems.find((i) => i.name === selected.name && !i.delivered);
      if (!real) return;
      real.delivered = true;
      real.deliveredBy = state.currentUser?.username || '-';
    });
    if (sale.deliveryItems.every((i) => i.delivered)) sale.orderStatus = 'finalizado';
    persist();
    renderOrders(false);
    openOrderDetails(activeOrderId);
  });
  closeOrderDetailsBtn?.addEventListener('click', () => { orderDetailsCard?.classList.add('hidden'); ordersTable?.closest('table')?.classList.remove('hidden'); finalizedOrdersTable?.closest('table')?.classList.remove('hidden'); });
  closeClosingDetailsBtn?.addEventListener('click', () => closingDetailsCard?.classList.add('hidden'));

  $('debtPersonDetailsTable')?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-pay-sale]');
    if (!b) return;
    openDebtPaymentModal({ saleIds: [b.dataset.paySale] });
  });
  payTotalDebtBtn?.addEventListener('click', () => {
    const debtorId = state.activeDebtorId;
    if (!debtorId) return;
    openDebtPaymentModal({ debtorId });
  });
  toggleDebtPaymentsBtn?.addEventListener('click', () => {
    debtPaymentsHistoryCard?.classList.toggle('hidden');
    renderDebtPayments();
  });
  searchDebtPaymentsBtn?.addEventListener('click', renderDebtPayments);
  clearDebtPaymentsFilterBtn?.addEventListener('click', () => { if (debtPaymentsFromDate) debtPaymentsFromDate.value = ''; if (debtPaymentsToDate) debtPaymentsToDate.value = ''; renderDebtPayments(); });
  backFromStockPageBtn?.addEventListener('click', () => navigateTo(parentRoute(navStack[navStack.length - 1] || 'home'), { replace: true }));
  backFromWarehouseBtn?.addEventListener('click', () => navigateTo('home', { replace: true }));
  createComponentBtn?.addEventListener('click', () => {
    const name = (componentNameInput?.value || '').trim();
    const min = Math.max(0, Number(componentMinInput?.value || 0));
    if (!name) return;
    const exists = state.components.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    state.components.push({ id: uid(), name, qty: 0, min });
    if (componentNameInput) componentNameInput.value = '';
    persist();
    renderWarehouse();
  });
  linkComponentBtn?.addEventListener('click', () => {
    const productId = warehouseProductSelect?.value || '';
    const componentId = warehouseComponentSelect?.value || '';
    const qty = Math.max(0.01, Number(warehouseLinkQtyInput?.value || 1));
    if (!productId || !componentId) return;
    if (!Array.isArray(state.componentLinks[productId])) state.componentLinks[productId] = [];
    const existing = state.componentLinks[productId].find((x) => x.componentId === componentId);
    if (existing) existing.qty = qty;
    else state.componentLinks[productId].push({ componentId, qty });
    persist();
    renderWarehouse();
  });
  warehouseAddPurchaseBtn?.addEventListener('click', () => {
    const componentId = warehouseMoveComponentSelect?.value || '';
    const qty = Math.max(0.01, Number(warehouseMoveQtyInput?.value || 0));
    if (!componentId || !qty) return;
    registerComponentMove({ componentId, tipo: 'compra', cantidad: qty, descripcion: (warehouseMoveDescInput?.value || '').trim() || 'Compra de almacén' });
    if (warehouseMoveDescInput) warehouseMoveDescInput.value = '';
    persist();
    renderWarehouse();
  });
  warehouseAddWasteBtn?.addEventListener('click', () => {
    const componentId = warehouseMoveComponentSelect?.value || '';
    const qty = Math.max(0.01, Number(warehouseMoveQtyInput?.value || 0));
    const desc = (warehouseMoveDescInput?.value || '').trim();
    if (!componentId || !qty || !desc) return alert('La descripción es obligatoria para desecho.');
    registerComponentMove({ componentId, tipo: 'desecho', cantidad: -qty, descripcion: desc });
    if (warehouseMoveDescInput) warehouseMoveDescInput.value = '';
    persist();
    renderWarehouse();
  });
  warehouseTable?.addEventListener('click', (e) => {
    const edit = e.target.closest('button[data-comp-edit]');
    if (edit) {
      const comp = componentById(edit.dataset.compEdit);
      if (!comp) return;
      const newName = prompt('Nombre componente', comp.name);
      if (!newName) return;
      const newMin = Number(prompt('Cantidad mínima', String(comp.min || 0)) || comp.min || 0);
      comp.name = String(newName).trim() || comp.name;
      comp.min = Math.max(0, Number(newMin || 0));
      persist();
      renderWarehouse();
      return;
    }
    const del = e.target.closest('button[data-comp-del]');
    if (!del) return;
    const compId = del.dataset.compDel;
    state.components = state.components.filter((c) => c.id !== compId);
    Object.keys(state.componentLinks || {}).forEach((pid) => {
      state.componentLinks[pid] = (state.componentLinks[pid] || []).filter((x) => x.componentId !== compId);
    });
    persist();
    renderWarehouse();
  });
  stockPageAddBtn?.addEventListener('click', () => {
    const pid = stockPageProductSelect?.value || '';
    const qty = Math.max(1, Number(stockPageAddQtyInput?.value || 1));
    const prod = state.products.find((p) => p.id === pid);
    if (!prod) return;
    prod.stockCurrent = Number(prod.stockCurrent || 0) + qty;
    persist();
    renderProducts();
    renderSaleSelectors();
    renderStockPage();
  });
  stockPageExportBtn?.addEventListener('click', exportStockToExcel);
  stockPageImportBtn?.addEventListener('click', () => stockPageImportFileInput?.click());
  stockPageImportFileInput?.addEventListener('change', (e) => {
    const file = e.target?.files?.[0];
    importStockFromExcelFile(file);
    if (stockPageImportFileInput) stockPageImportFileInput.value = '';
    renderStockPage();
  });

  stockPageTable?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-stock-clear]');
    if (!b) return;
    const product = state.products.find((p) => p.id === b.dataset.stockClear);
    if (!product) return;
    if (!confirm(`¿Vaciar stock de ${product.name}?`)) return;
    product.stockCurrent = 0;
    persist();
    renderProducts();
    renderSaleSelectors();
    renderStockPage();
  });
  clearAllStockBtn?.addEventListener('click', () => {
    if (!confirm('¿Vaciar TODO el stock? Esta acción no se puede deshacer.')) return;
    state.products.forEach((p) => { p.stockCurrent = 0; });
    persist();
    renderProducts();
    renderSaleSelectors();
    renderStockPage();
  });

  backFromDebtDetailsBtn?.addEventListener('click', () => {
    const t = $('debtPersonTitle');
    const d = $('debtPersonDetailsTable');
    if (t) t.textContent = 'Selecciona una persona para ver sus deudas pendientes';
    if (d) d.innerHTML = '';
    const tt = $('debtPersonTotal');
    if (tt) tt.textContent = 'Deuda total: Bs 0.00';
    state.activeDebtorId = '';
  });

  cashClosingsTable?.addEventListener('click', (e) => {
    const del = e.target.closest('button[data-closing-del]');
    if (del && hasPermission('deleteClosings')) {
      const removedId = del.dataset.closingDel;
      state.cashClosings = state.cashClosings.filter((c) => c.id !== removedId);
      state.deletedRecordIds = state.deletedRecordIds || { cashClosings: [], sales: [] };
      if (!Array.isArray(state.deletedRecordIds.cashClosings)) state.deletedRecordIds.cashClosings = [];
      if (!state.deletedRecordIds.cashClosings.includes(removedId)) state.deletedRecordIds.cashClosings.push(removedId);
      persist();
      renderCashClosings();
      return;
    }
    const pdf = e.target.closest('button[data-closing-pdf]');
    if (pdf) {
      downloadClosingPdf(pdf.dataset.closingPdf);
      return;
    }
    const b = e.target.closest('button[data-closing-id]');
    if (!b) return;
    renderClosingDetails(b.dataset.closingId);
  });
  document.addEventListener('click', (e) => {
    const sel = e.target.closest('#selectClosingsBtn');
    if (sel) {
      openSelectClosingsModal();
      return;
    }
    const gen = e.target.closest('#generateClosingsStatsBtn');
    if (gen) {
      const selected = activeClosingsList().filter((c) => state.selectedClosingIds.includes(c.id));
      if (!selected.length) return alert('Debe seleccionar al menos un cierre');
      state.generatedClosingsStats = buildStatsFromSelectedClosings();
      renderClosingsStatsOutput(state.generatedClosingsStats);
      const pdfBtn = document.getElementById('downloadClosingsStatsPdfBtn');
      if (pdfBtn) pdfBtn.disabled = false;
      return;
    }
    const pdfStats = e.target.closest('#downloadClosingsStatsPdfBtn');
    if (pdfStats) {
      downloadClosingsStatsPdf();
      return;
    }
    const modOpen = e.target.closest('#modifyOpeningCashBtn');
    if (modOpen) {
      openModifyOpeningCashModal();
      return;
    }
  });
}

async function bootstrap() {
  console.info('[boot][start]', { at: new Date().toISOString() });
  normalizeCloudSettings();
  let cloudBootHydrated = false;
  try {
    await ensureCloudSeedData({ force: true });
    await pullFromCloud({ force: true });
    cloudBootHydrated = true;
    bootCloudReady = true;
    console.info('[boot][cloud-ready]', { cloudBootHydrated, lastSyncAt: state.lastSyncAt || 0 });
  } catch (err) {
    console.error('[bootstrap] No se pudo hidratar desde cloud al inicio. Se usará respaldo local temporal.', { message: err?.message });
  }
  ensureUsers();
  ensureSeedData();
  ensureProductStockDefaults();
  normalizePeopleData();
  ensurePeopleData();
  if (!state.userSalesModes || typeof state.userSalesModes !== 'object') state.userSalesModes = {};
  if (!state.touchUiConfigByUser || typeof state.touchUiConfigByUser !== 'object') state.touchUiConfigByUser = {};
  if (!state.categoryImages || typeof state.categoryImages !== 'object') state.categoryImages = {};

  (state.products || []).forEach((p) => {
    if (p?.imageUrl && String(p.imageUrl).startsWith('idb:')) delete p.imageUrl;
    if (!p?.imageUrl && p?.imageDataUrl && !String(p.imageDataUrl).startsWith('data:')) p.imageUrl = p.imageDataUrl;
    if (p?.imageDataUrl && String(p.imageDataUrl).startsWith('idb:')) delete p.imageDataUrl;
  });
  Object.keys(state.categoryImages || {}).forEach((key) => {
    const raw = String(state.categoryImages[key] || '');
    if (raw.startsWith('idb:')) delete state.categoryImages[key];
  });

  if (!state.orderCounters || typeof state.orderCounters !== 'object') state.orderCounters = {};
  if (!state.deletedRecordIds || typeof state.deletedRecordIds !== 'object') state.deletedRecordIds = { cashClosings: [], sales: [] };
  if (!Array.isArray(state.deletedRecordIds.cashClosings)) state.deletedRecordIds.cashClosings = [];
  if (!Array.isArray(state.deletedRecordIds.sales)) state.deletedRecordIds.sales = [];
  normalizeWarehouseData();
  normalizeDebtPaymentsData();
  normalizeCashState();
  bootCashReady = Boolean(getActiveCashBox() || state.systemStatus === 'CAJA_CERRADA');
  console.info('[boot][cash-ready]', { bootCashReady, activeCashBoxId: state.activeCashBoxId || '', systemStatus: state.systemStatus });
  syncAppConfig();
  saveLocalState();
  applySettings();
  ensureSalesModeButton();
  wireEvents();
  Promise.resolve().then(() => ensureJsPdfLibs()).catch(() => {});
  renderOrdersVisibility();
  beginSessionWatcher();
  renderSaleSelectors();
  renderCart();
  renderPeopleSelectors();
  renderDebtors();
  renderOrders(false);
  renderSalesHistory();
  renderDeletedSales();
  renderDebtPayments();
  renderProducts();
  renderOutflows();
  renderWarehouse();
  renderSummary();
  renderSoldProductsList();
  const validSession = Boolean(state.currentUser && currentUserRecord());
  window.addEventListener('storage', (e) => { if (!e.key || !e.key.startsWith('cafeteria_')) return; pullFromCloud({ force: true }); });
  window.addEventListener('hashchange', () => { if (applyingRoute) return; applyRoute(); });
  setInterval(() => { if (document.hidden) return; pullFromCloud(); }, CLOUD_POLL_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullFromCloud({ force: true }); });
  window.addEventListener('online', () => { pullFromCloud({ force: true }); startFirebaseRealtimeListener(); });
  Promise.resolve().then(() => migrateCategoryImageRefsToDataUrls()).catch(() => {});
  if (!cloudBootHydrated) {
    if (state.currentUser && validSession) {
      try { await pullFromCloud({ force: true }); } catch {}
    } else {
      Promise.resolve().then(() => pullFromCloud({ force: true })).catch(() => {});
    }
  }
  cloudHydrated = cloudHydrated || cloudBootHydrated;
  console.info('[boot][sales-ready]', { salesCount: state.sales?.length || 0, cloudHydrated });
  startFirebaseRealtimeListener();
  maybeForceLogoutFromClosure();
  if (state.currentUser && validSession && validateSessionPolicy({ silent: true })) {
    navStack = ['home'];
    navigateTo(normalizeRoute(window.location.hash || '#home'), { replace: true });
    if (!getActiveCashBox()) setMsg(homeMessage, 'La caja está cerrada. Espera a que un usuario autorizado la abra.', false);
  } else {
    state.currentUser = null;
    persist({ sync: false });
    showLogin();
  }
}

bootstrap();
