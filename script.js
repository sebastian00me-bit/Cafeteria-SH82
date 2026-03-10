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
  categoryImages: JSON.parse(localStorage.getItem('cafeteria_category_images') || '{}')
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
const salesConfigCard = $('salesConfigCard');
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
const closeCashBtnCard = $('closeCashBtn');
let activeSaleCategory = '';
let activeOrderId = '';
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
  firebaseDbUrl: 'https://sh82-d2bf1-default-rtdb.firebaseio.com',
  firebaseDbToken: 'LTQRqLhvxLxBkGi3a9ia2tlTSvDRu0lrxxczVB4e',
  firebaseDbPath: SHARED_DB_PATH
};

function normalizeCloudSettings() {
  state.settings = { ...defaultCloudConfig, ...(state.settings || {}) };
  if (!String(state.settings.firebaseDbUrl || '').trim()) state.settings.firebaseDbUrl = defaultCloudConfig.firebaseDbUrl;
  if (!String(state.settings.firebaseDbToken || '').trim()) state.settings.firebaseDbToken = defaultCloudConfig.firebaseDbToken;
  const currentPath = String(state.settings.firebaseDbPath || '').trim();
  if (!currentPath || currentPath === LEGACY_DB_PATH) state.settings.firebaseDbPath = SHARED_DB_PATH;
}

normalizeCloudSettings();


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
  return (state.products || []).map((p) => {
    const raw = String(p?.imageDataUrl || '');
    if (!raw.startsWith('data:')) return p;
    const copy = { ...p };
    delete copy.imageDataUrl;
    return copy;
  });
}

function categoryImagesForLocalPersistence() {
  const out = {};
  Object.entries(state.categoryImages || {}).forEach(([key, value]) => {
    const raw = String(value || '');
    if (!raw.startsWith('data:')) out[key] = value;
  });
  return out;
}

function saveLocalState() {
  localStorage.setItem('cafeteria_last_sync_at', String(state.lastSyncAt || 0));
  localStorage.setItem('cafeteria_force_logout_at', String(state.forceLogoutAt || 0));
  localStorage.setItem('cafeteria_cash_boxes', JSON.stringify(state.cashBoxes || []));
  localStorage.setItem('cafeteria_active_cash_box_id', state.activeCashBoxId || '');
  localStorage.setItem('cafeteria_system_status', state.systemStatus || 'CAJA_CERRADA');
  localStorage.setItem('cafeteria_products', JSON.stringify(productsForLocalPersistence()));
  localStorage.setItem('cafeteria_sales', JSON.stringify(state.sales));
  localStorage.setItem('cafeteria_deleted_sales', JSON.stringify(state.deletedSales));
  localStorage.setItem('cafeteria_cash_closings', JSON.stringify(state.cashClosings));
  localStorage.setItem('cafeteria_cash_session', JSON.stringify(state.cashSession));
  localStorage.setItem('cafeteria_users', JSON.stringify(state.users));
  localStorage.setItem('cafeteria_current_user', JSON.stringify(state.currentUser));
  localStorage.setItem('cafeteria_settings', JSON.stringify(state.settings));
  localStorage.setItem('cafeteria_categories', JSON.stringify(state.categories));
  localStorage.setItem('cafeteria_people', JSON.stringify(state.people));
  localStorage.setItem('cafeteria_stock_config', JSON.stringify(state.stockConfig));
  localStorage.setItem('cafeteria_outflows', JSON.stringify(state.outflows));
  localStorage.setItem('cafeteria_debt_payments', JSON.stringify(state.debtPayments));
  localStorage.setItem('cafeteria_components', JSON.stringify(state.components || []));
  localStorage.setItem('cafeteria_component_links', JSON.stringify(state.componentLinks || {}));
  localStorage.setItem('cafeteria_component_moves', JSON.stringify(state.componentMoves || []));
  localStorage.setItem('cafeteria_queued_orders', JSON.stringify(state.queuedOrders || []));
  localStorage.setItem('cafeteria_removed_people_ids', JSON.stringify(state.removedPeopleIds || []));
  localStorage.setItem('cafeteria_user_sales_modes', JSON.stringify(state.userSalesModes || {}));
  localStorage.setItem('cafeteria_touch_ui_config_by_user', JSON.stringify(state.touchUiConfigByUser || {}));
  localStorage.setItem('cafeteria_category_images', JSON.stringify(categoryImagesForLocalPersistence()));
}

function persist(options = {}) {
  if (state.currentUser && !validateSessionPolicy({ silent: false })) return;
  saveLocalState();
  if (options.sync === false) return;
  Promise.resolve().then(syncToCloud);
}

function defaultPermissions() {
  return { closeCash: true, deleteSales: true, accessSettings: true, manageProducts: true, manageCombos: true, editProductPrices: true, viewOrders: true, deleteClosings: true, deleteCashMovements: true, clearDeletedSalesHistory: true, manageUsers: true, viewSalesButton: true, viewSettingsButton: true, viewCloseCashButton: true, viewProductsTab: true, viewConfigVentasTab: true, viewDebtorsTab: true, viewSummaryTab: true, viewClosingsTab: true, viewWarehouseButton: true, viewSalesModeButton: true };
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

function canStartOrCloseCash() {
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
  if (!state.activeCashBoxId) return [];
  return state.sales.filter((sale) => sale.cashBoxId === state.activeCashBoxId);
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
  if (Number(state.forceLogoutAt || 0) && Number(state.currentUser.loginAt || 0) <= Number(state.forceLogoutAt || 0)) {
    logout('La caja fue cerrada. Debes iniciar sesión nuevamente.');
    return false;
  }
  if (user.enabled === false) {
    user.lastLogoutAt = Date.now();
    saveLocalState();
    logout('Usuario inhabilitado por administrador.');
    return false;
  }
  const last = Math.max(
    Number(user.lastActivityAt || 0),
    Number(state.currentUser.lastActivityAt || 0),
    Number(state.currentUser.loginAt || 0)
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
  if (currentSalesMode() === 'touch') renderTouchSaleUi();
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
  const list = ui.view === 'categories' ? cats : state.products.filter((p) => !p.hidden && p.category === ui.category);
  const pages = Math.max(1, Math.ceil(list.length / cap));
  if (ui.page >= pages) ui.page = 0;
  const pageItems = list.slice(ui.page * cap, (ui.page + 1) * cap);
  const renderCard = (item) => {
    if (ui.view === 'categories') {
      const hasImg = Boolean(state.categoryImages?.[item]);
      const categorySrc = resolveImageSource(state.categoryImages[item]);
      const img = categorySrc ? `<img class=\"touch-media\" src=\"${categorySrc}\" alt=\"${item}\" />` : '';
      return `<button class="touch-card ${hasImg ? 'with-image' : 'no-image'}" data-touch-cat="${item}" type="button">${img}<strong class="touch-card-title">${item}</strong></button>`;
    }
    const hasImg = Boolean(item.imageDataUrl);
    const productSrc = resolveImageSource(item.imageDataUrl);
    const img = productSrc ? `<img class=\"touch-media\" src=\"${productSrc}\" alt=\"${item.name}\" />` : '';
    return `<button class="touch-card ${hasImg ? 'with-image' : 'no-image'}" data-touch-prod="${item.id}" type="button">${img}<strong class="touch-card-title">${item.name}</strong><span class="touch-card-price">${money(item.price)}</span></button>`;
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
  host.querySelectorAll('[data-touch-inc]').forEach((b) => b.addEventListener('click', () => { const i = state.currentCart.find((x) => x.id === b.dataset.touchInc); if (!i) return; i.qty += 1; i.finalSubtotal = i.price*i.qty - (i.price*i.qty*(i.discountPct||0)/100); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-dec]').forEach((b) => b.addEventListener('click', () => { const i = state.currentCart.find((x) => x.id === b.dataset.touchDec); if (!i) return; i.qty = Math.max(1, i.qty-1); i.finalSubtotal = i.price*i.qty - (i.price*i.qty*(i.discountPct||0)/100); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-rm]').forEach((b) => b.addEventListener('click', () => { state.currentCart = state.currentCart.filter((x) => x.id !== b.dataset.touchRm); renderCart(); renderTouchSaleUi(); }));
  host.querySelectorAll('[data-touch-tools]').forEach((b) => b.addEventListener('click', () => openTouchItemTools(b.dataset.touchTools)));
  host.querySelector('#touchProceedPayBtn')?.addEventListener('click', () => { const paymentCard = paymentType?.closest('.card'); paymentCard?.classList.remove('hidden'); paymentType?.scrollIntoView({ behavior:'smooth', block:'center' }); });
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

function resolveImageSource(value) {
  const raw = String(value || '');
  if (!raw) return '';
  if (!raw.startsWith('idb:')) return raw;
  if (imageMissingRefs[raw]) return '';
  if (imagePreviewCache[raw]) return imagePreviewCache[raw];
  if (!imageLoadInFlight[raw]) {
    imageLoadInFlight[raw] = (async () => {
      try {
        const blob = await imageDbGet(raw.slice(4));
        if (blob) imagePreviewCache[raw] = URL.createObjectURL(blob);
        else imageMissingRefs[raw] = true;
      } catch {}
      finally {
        delete imageLoadInFlight[raw];
        scheduleImageUiRefresh({ products: true, touch: true });
      }
    })();
  }
  return '';
}

async function saveImageFileToStorage(file, previousValue = '') {
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(r.error || new Error('No se pudo leer la imagen.'));
    r.readAsDataURL(file);
  });
  const ref = `idb:${uid()}`;
  await imageDbPut(ref.slice(4), file);
  imagePreviewCache[ref] = URL.createObjectURL(file);
  const prevKey = imageRefKey(previousValue);
  if (prevKey) {
    await imageDbDelete(prevKey);
    if (imagePreviewCache[previousValue]) {
      try { URL.revokeObjectURL(imagePreviewCache[previousValue]); } catch {}
      delete imagePreviewCache[previousValue];
    }
  }
  return dataUrl;
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
    Promise.resolve().then(syncToCloud);
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
      const previous = p.imageDataUrl;
      try {
        p.imageDataUrl = await saveImageFileToStorage(payload.file, previous);
      } catch {
        p.imageDataUrl = payload.dataUrl || previous;
      }
      const ok = persistImageChange(() => { p.imageDataUrl = previous; });
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
        state.categoryImages[categoryName] = await saveImageFileToStorage(payload.file, previous);
      } catch {
        state.categoryImages[categoryName] = payload.dataUrl || previous;
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
  if (state.settings.logoDataUrl && homeLogo && logoPlaceholder) {
    homeLogo.src = state.settings.logoDataUrl;
    homeLogo.classList.remove('hidden');
    logoPlaceholder.classList.add('hidden');
  }
  if (state.settings.logoDataUrl && posHeaderLogo) {
    posHeaderLogo.src = state.settings.logoDataUrl;
    posHeaderLogo.classList.remove('hidden');
  }
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
      ['Usuario apertura', closing.usuario_apertura || '-'],
      ['Usuario cierre', closing.usuario_cierre || '-'],
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
      ['Total transferencias', money(agg.transfer)],
      ['Total QR', money(agg.qr)],
      ['Otros métodos', money(agg.others)],
      ['Total gastos', money(agg.outTotal)],
      ['Total esperado', money(agg.expected)],
      ['Total contado', money(agg.counted)],
      ['Diferencia', money(agg.diff)],
      ['Estado final', agg.diff === 0 ? 'CUADRADO' : (agg.diff > 0 ? 'SOBRANTE' : 'FALTANTE')]
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
  if (closingSummaryText) closingSummaryText.innerHTML = `<div class="card"><h4>SECCIÓN 1 – INFORMACIÓN GENERAL</h4><p>Número de cierre: ${String(closing.id || '-').slice(-8)}</p><p>Fecha de apertura: ${openAt.toLocaleDateString()}</p><p>Hora de apertura: ${openAt.toLocaleTimeString()}</p><p>Fecha de cierre: ${closeAt.toLocaleDateString()}</p><p>Hora de cierre: ${closeAt.toLocaleTimeString()}</p><p>Usuario que abrió: ${closing.usuario_apertura || '-'}</p><p>Usuario que cerró: ${closing.usuario_cierre || '-'}</p><p>Tiempo total de caja abierta: ${formatDurationMs(closeAt - openAt)}</p></div><div class="card"><h4>Detalle para enviar</h4><p>Cambio inicial: ${money(openingCash)}</p><p>Valor efectivo de ventas: ${money(totalCash)}</p><p>Valor QR de ventas: ${money(totalQr)}</p><p>Salida efectivo: ${money(outCash)}</p><p>Entrada efectivo: ${money(inCash)}</p><p>Salida QR: ${money(outQr)}</p><p>Entrada QR: ${money(inQr)}</p><p>Valor final en caja: ${money(totalInBox)}</p><p>Valor final descontando cambio inicial: ${money(realDelivered)}</p></div><div class="card"><h4>SECCIÓN 2 – RESUMEN FINANCIERO</h4><p>Inicio de caja: ${money(openingCash)}</p><p>Total ventas brutas: ${money(grossSales)}</p><p>Total descuentos: ${money(totalDiscounts)}</p><p>Total ingresos netos: ${money(grossSales - totalDiscounts)}</p><p>Total en efectivo: ${money(totalCash)}</p><p>Total QR: ${money(totalQr)}</p><p>Total salidas externas efectivo: ${money(outCash)}</p><p>Total salidas externas QR: ${money(outQr)}</p><p>Total entradas externas efectivo: ${money(inCash)}</p><p>Total entradas externas QR: ${money(inQr)}</p><p>Total efectivo final: ${money(totalCashFinal)}</p><p>Total QR final: ${money(totalQrFinal)}</p><p>Valor total en caja (incluye valor de caja): ${money(totalInBox)}</p><p>Valor efectivo real de venta entregado: ${money(realDelivered)}</p></div><div class="card"><h4>Productos vendidos</h4><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead><tbody>${agg.products.length ? agg.products.map((row) => `<tr><td>${row.name}</td><td>${row.qty}</td><td>${money(row.total)}</td></tr>`).join('') : '<tr><td colspan="3">Sin productos vendidos.</td></tr>'}</tbody></table></div><div class="card"><h4>SECCIÓN 3 – MÉTRICAS OPERATIVAS</h4><p>Cantidad total de ventas: ${closing.salesCount || sales.length}</p><p>Total productos vendidos: ${agg.qtyTotal}</p><p>Ticket promedio: ${money(agg.avgTicket)}</p><p>Venta más alta: ${money(agg.saleMax)}</p><p>Venta más baja: ${money(agg.saleMin)}</p><p>Ventas eliminadas: ${deletedCount} · Mov. caja: ${outflowCount} · Pagos deuda: ${debtPaymentsCount}</p></div><div class="card"><h4>Detalle de entradas</h4><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Método</th><th>Monto</th><th>Usuario</th></tr></thead><tbody>${entries.map((m) => `<tr><td>${new Date(m.createdAt).toLocaleString()}</td><td>${m.description || '-'}</td><td>${m.method || '-'}</td><td>${money(m.amount || 0)}</td><td>${m.user || '-'}</td></tr>`).join('') || '<tr><td colspan="5">Sin entradas.</td></tr>'}</tbody></table></div><div class="card"><h4>Detalle de salidas</h4><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Método</th><th>Monto</th><th>Usuario</th></tr></thead><tbody>${exits.map((m) => `<tr><td>${new Date(m.createdAt).toLocaleString()}</td><td>${m.description || '-'}</td><td>${m.method || '-'}</td><td>${money(m.amount || 0)}</td><td>${m.user || '-'}</td></tr>`).join('') || '<tr><td colspan="5">Sin salidas.</td></tr>'}</tbody></table></div>`;
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
  state.sales.filter((s) => Number(s.debtAmount || 0) > 0 && s.debtorId).forEach((s) => {
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
    const sales = state.sales.filter((s) => s.debtorId === btn.dataset.debtorId && Number(s.debtAmount || 0) > 0);
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
  if (head) head.innerHTML = '<th>Usuario</th><th>Autoriza</th><th>Cerrar caja</th><th>Eliminar ventas</th><th>Config. principal</th><th>Productos</th><th>Eliminar cierres</th><th>Eliminar mov. caja</th><th>Vaciar eliminadas</th><th>Gestionar usuarios</th><th>Acción</th>';
  usersTable.innerHTML = state.users.map((u) => `<tr><td>${u.username}</td><td>${u.permissions?.authorizeCash ? 'Sí' : 'No'}</td><td>${u.permissions?.closeCash ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteSales ? 'Sí' : 'No'}</td><td>${u.permissions?.accessSettings ? 'Sí' : 'No'}</td><td>${u.permissions?.manageProducts ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteClosings ? 'Sí' : 'No'}</td><td>${u.permissions?.deleteCashMovements ? 'Sí' : 'No'}</td><td>${u.permissions?.clearDeletedSalesHistory ? 'Sí' : 'No'}</td><td>${u.permissions?.manageUsers ? 'Sí' : 'No'}</td><td><button class="secondary" data-user-edit="${u.username}" type="button">Editar</button> <button class="secondary" data-user-del="${u.username}" type="button">Eliminar</button> <button class="secondary" data-user-toggle-enabled="${u.username}" type="button">${u.enabled === false ? 'Habilitar' : 'Inhabilitar'}</button></td></tr>`).join('');
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
  if (saveUsersBtn) saveUsersBtn.onclick = () => {
    persist();
    setMsg(homeMessage, 'Usuarios y permisos guardados correctamente.');
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
      ensureUsers();
      persist();
      renderUsers();
      alert('Usuarios importados correctamente.');
    } catch (error) {
      console.error('[users] import error', error);
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

function renderProducts() {
  const selectedCategory = productCategory?.value || '';
  const sorted = state.products.slice().sort((a, b) => Number(Boolean(a.hidden)) - Number(Boolean(b.hidden)));
  const productsHead = productsTable?.closest('table')?.querySelector('thead tr');
  if (productsHead) productsHead.innerHTML = '<th>Categoría</th><th>Producto</th><th>Precio</th><th>Acciones</th><th>Imagen</th>';
  const categoriesHead = categoriesTable?.closest('table')?.querySelector('thead tr');
  if (categoriesHead) categoriesHead.innerHTML = '<th>Categoría</th><th>Acciones</th><th>Imagen</th>';
  if (productsTable) productsTable.innerHTML = sorted.map((p) => { const st = getImageUploadStatus('product', p.id); const uploadBtnText = st?.uploading ? 'Subiendo...' : 'Subir imagen'; const prodSrc = resolveImageSource(p.imageDataUrl); const imageBlock = prodSrc ? `<div class=\"image-cell\"><img class=\"image-thumb\" src=\"${prodSrc}\" alt=\"${p.name}\" /><button class=\"danger\" data-prod-img-del=\"${p.id}\" type=\"button\">X</button></div>` : '<span class=\"muted\">Sin imagen</span>'; const err = st?.error ? `<div class=\"upload-error\">${st.error}</div>` : ''; return `<tr><td>${p.category || '-'}</td><td>${p.name}</td><td>${money(p.price)}</td><td><button class=\"secondary\" data-prod-edit=\"${p.id}\" type=\"button\">Editar</button> <button class=\"secondary\" data-prod-img=\"${p.id}\" type=\"button\" ${st?.uploading ? 'disabled' : ''}>${uploadBtnText}</button> <button class=\"secondary\" data-prod-hide=\"${p.id}\" type=\"button\">${p.hidden ? 'Mostrar' : 'Ocultar'}</button> <button class=\"secondary\" data-prod-del=\"${p.id}\" type=\"button\">Eliminar</button></td><td>${imageBlock}${renderImageUploadProgress('product', p.id)}${err}</td></tr>`; }).join('');
  if (categoriesTable) categoriesTable.innerHTML = (state.categories || []).map((c) => { const st = getImageUploadStatus('category', c); const uploadBtnText = st?.uploading ? 'Subiendo...' : 'Subir imagen'; const catSrc = resolveImageSource(state.categoryImages?.[c]); const imageBlock = catSrc ? `<div class=\"image-cell\"><img class=\"image-thumb\" src=\"${catSrc}\" alt=\"${c}\" /><button class=\"danger\" data-cat-img-del=\"${c}\" type=\"button\">X</button></div>` : '<span class=\"muted\">Sin imagen</span>'; const err = st?.error ? `<div class=\"upload-error\">${st.error}</div>` : ''; return `<tr><td>${c}</td><td><button class=\"secondary\" data-cat-img=\"${c}\" type=\"button\" ${st?.uploading ? 'disabled' : ''}>${uploadBtnText}</button> ${c === 'Todos' ? '' : `<button class=\"secondary\" data-cat-del=\"${c}\" type=\"button\">Eliminar</button>`}</td><td>${imageBlock}${renderImageUploadProgress('category', c)}${err}</td></tr>`; }).join('');
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

function renderSalesHistory() {
  if (!salesTable) return;
  const userFilter = salesUserFilter?.value || '';
  const users = ['<option value="">Todos los usuarios</option>'].concat(state.users.map((u) => `<option value="${u.username}">${u.username}</option>`));
  if (salesUserFilter) {
    const prev = salesUserFilter.value;
    salesUserFilter.innerHTML = users.join('');
    salesUserFilter.value = prev;
  }
  let list = salesForActiveCashBox().filter((sale) => !sale.carryOverDebt).slice();
  const searchOrder = (salesOrderSearchInput?.value || '').trim();
  if (userFilter) list = list.filter((s) => s.user === userFilter);
  if (searchOrder) list = list.filter((s) => String(s.orderNumber || '').includes(searchOrder));
  salesTable.innerHTML = list.length ? list.map((sale) => `<tr><td>#${orderNumberLabel(sale.orderNumber)}</td><td>${new Date(sale.createdAt).toLocaleString()}</td><td>${money(sale.total)}</td><td>${sale.payment}</td><td><button type="button" class="secondary" data-sale-act="view" data-sale-id="${sale.id}">Ver Venta</button>${hasPermission('deleteSales') ? ` <button type="button" class="secondary" data-sale-act="edit" data-sale-id="${sale.id}">Editar venta</button> <button type="button" class="secondary" data-sale-act="del" data-sale-id="${sale.id}">Eliminar venta</button>` : ''}</td><td>${sale.user}</td></tr>`).join('') : '<tr><td colspan="6">Sin ventas.</td></tr>';
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
    persist();
    renderDebtors();
    renderSummary();
  renderSoldProductsList();
    renderDebtPayments();
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
    updatedAt: Date.now()
  };
}

async function syncToCloud() {
  if (!state.settings.firebaseDbUrl) return;
  try {
    const token = state.settings.firebaseDbToken ? `?auth=${encodeURIComponent(state.settings.firebaseDbToken)}` : '';
    const url = `${state.settings.firebaseDbUrl.replace(/\/$/, '')}/${state.settings.firebaseDbPath || SHARED_DB_PATH}.json${token}`;
    const remoteResp = await fetch(url, { headers: { 'X-Firebase-ETag': 'true' } });
    const remoteData = await remoteResp.json();
    const remoteEtag = remoteResp.headers.get('ETag');
    const remoteUpdatedAt = Number(remoteData?.updatedAt || 0);
    if (remoteUpdatedAt && remoteUpdatedAt > Number(state.lastSyncAt || 0)) {
      await pullFromCloud({ force: true });
      if (syncStatus) syncStatus.textContent = 'Sincronización remota más reciente detectada. Estado actualizado sin sobrescribir.';
      return;
    }

    const payload = snapshotPayload();
    if (remoteUpdatedAt && Number(payload.updatedAt || 0) <= remoteUpdatedAt) payload.updatedAt = remoteUpdatedAt + 1;
    const putHeaders = { 'Content-Type': 'application/json' };
    if (remoteEtag) putHeaders['if-match'] = remoteEtag;
    const putResp = await fetch(url, { method: 'PUT', headers: putHeaders, body: JSON.stringify(payload) });
    if (putResp.status === 412) {
      await pullFromCloud({ force: true });
      if (syncStatus) syncStatus.textContent = 'Conflicto detectado. Se actualizó estado remoto sin sobrescribir.';
      return;
    }
    if (!putResp.ok) throw new Error(`sync put failed: ${putResp.status}`);
    state.lastSyncAt = Number(payload.updatedAt || Date.now());
    saveLocalState();
    if (syncStatus) syncStatus.textContent = 'Sincronización enviada.';
  } catch {
    if (syncStatus) syncStatus.textContent = 'Error de sincronización.';
  }
}

async function pullFromCloud(options = {}) {
  if (!state.settings.firebaseDbUrl) return;
  if (cloudPullInFlight) return cloudPullInFlight;
  cloudPullInFlight = (async () => {
  try {
    const token = state.settings.firebaseDbToken ? `?auth=${encodeURIComponent(state.settings.firebaseDbToken)}` : '';
    const url = `${state.settings.firebaseDbUrl.replace(/\/$/, '')}/${state.settings.firebaseDbPath || SHARED_DB_PATH}.json${token}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data || !data.updatedAt) return;
    if (!options.force && data.updatedAt <= state.lastSyncAt) {
      return;
    }
    state.lastSyncAt = Number(data.updatedAt || Date.now());
    state.forceLogoutAt = Number(data.forceLogoutAt || 0);
    ['products','sales','deletedSales','cashClosings','cashSession','users','settings','categories','people','stockConfig','outflows','debtPayments','components','componentLinks','componentMoves','cashBoxes','activeCashBoxId','systemStatus','userSalesModes','touchUiConfigByUser','categoryImages'].forEach((k) => {
      if (data[k] !== undefined) state[k] = data[k];
    });
    normalizeCloudSettings();
    normalizeWarehouseData();
    normalizeDebtPaymentsData();
    normalizePeopleData();
    normalizeCashState();
  syncAppConfig();
    console.info('[cloud] estado sincronizado', { activeCashBoxId: state.activeCashBoxId, systemStatus: state.systemStatus });
    saveLocalState();
    renderOrdersVisibility();
    renderProducts(); renderOrders(false); renderSalesHistory(); renderDeletedSales(); renderDebtors(); renderDebtPayments(); renderWarehouse(); renderSummary(); renderCashStatus(); renderHomeActions();
    const currentRoute = normalizeRoute(window.location.hash || '#home');
    const inSettingsBranch = currentRoute === 'settings' || currentRoute.startsWith('settings/');
    const inPosBranch = currentRoute.startsWith('pos/') || currentRoute === 'cash/closings';
    if (state.currentUser && !getActiveCashBox() && !inSettingsBranch && !inPosBranch) {
      maybeForceLogoutFromClosure();
    }
    applyRoute();
  } catch {}
  finally {
    cloudPullInFlight = null;
  }
  })();
  return cloudPullInFlight;
}

function renderHomeActions() {
  const active = isCashOpen();
  if (goSalesBtn) goSalesBtn.classList.toggle('hidden', !active || !hasPermission('viewSalesButton'));
  if (closeCashBtn) closeCashBtn.classList.toggle('hidden', !active || !canStartOrCloseCash() || !hasPermission('viewCloseCashButton'));
  if (startCashBtn) startCashBtn.classList.toggle('hidden', active || !canStartOrCloseCash());
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
  loginScreen?.classList.add('hidden');
  homeScreen?.classList.remove('hidden');
  posScreen?.classList.add('hidden');
  stockScreen?.classList.add('hidden');
  warehouseScreen?.classList.add('hidden');
  settingsCard?.classList.add('hidden');
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
  await pullFromCloud();
  markUserActivity('login');
  persist();
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
  if (!canStartOrCloseCash()) {
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
  await pullFromCloud({ force: true });
  console.info('[cash] startCashSession()', { openingAmount, user: state.currentUser?.username || '-' });
  if (!canStartOrCloseCash()) {
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

function closeCashSession() {
  if (!canStartOrCloseCash()) return setMsg(homeMessage, 'No tienes permiso para cerrar caja.', false);
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
  state.users = (state.users || []).map((u) => ({ ...u, lastLogoutAt: state.forceLogoutAt }));
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
  setMsg(homeMessage, 'La caja ha sido cerrada.', false);
}

async function registerSale() {
  touchSessionActivity();
  if (!state.currentUser) return setMsg(saleMessage, 'Inicia sesión para registrar ventas.', false);
  if (!getActiveCashBox()) return setMsg(saleMessage, 'Debes abrir caja para vender.', false);
  if (!state.currentCart.length) return setMsg(saleMessage, 'Añade productos antes de generar la venta.', false);
  await pullFromCloud();
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
  const activeCashBoxId = state.activeCashBoxId;
  const sale = { id: uid(), cashBoxId: activeCashBoxId, orderNumber: state.cashSession?.orderCounter || 1, createdAt: new Date().toISOString(), user: state.currentUser.username, items: state.currentCart.map((i) => ({ ...i })), total: totals.final, payment, breakdown, debtAmount, debtorId, paymentStatus: debtAmount > 0 ? 'pendiente' : 'realizado', orderStatus: 'pendiente', deliveryItems, carryOverDebt: false };
  if (state.cashSession) state.cashSession.orderCounter = (state.cashSession.orderCounter || 1) + 1;
  if (isStockEnabled()) {
    for (const item of state.currentCart) {
      const p = state.products.find((x) => x.id === item.id);
      if (!p) continue;
      const next = Number(p.stockCurrent || 0) - Number(item.qty || 0);
      p.stockCurrent = next;
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
  persist();
  renderCart();
  renderOrders(false);
  setMsg(saleMessage, 'Venta registrada correctamente.');
  refreshFinancialViews();
  renderWarehouse();
  if (saleSuccessTitle) saleSuccessTitle.textContent = `Venta realizada exitosamente · Pedido #${orderNumberLabel(sale.orderNumber)}`;
  saleSuccessModal?.classList.remove('hidden');
}

function hideSaleSuccessModal() { saleSuccessModal?.classList.add('hidden'); saleFormContainer?.classList.add('hidden'); state.currentCart = []; activeSaleCategory=''; if (paymentType) paymentType.value='efectivo'; cashPaymentFields?.classList.remove('hidden'); if (cashPaidInput) cashPaidInput.value=''; mixedFields?.classList.add('hidden'); debtFields?.classList.add('hidden'); partialFields?.classList.add('hidden'); renderCart(); renderSaleSelectors(); }

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
  if (route in { 'settings/main':1, 'settings/sales':1, 'settings/users':1, 'settings/users/activity':1, 'stock':1, 'warehouse':1, 'warehouse/gestion':1, 'warehouse/movimientos':1, 'warehouse/movimientos/archivados':1, 'pos/ventas':1, 'pos/pedidos':1, 'pos/configVentas':1, 'pos/deudas':1, 'pos/resumen':1, 'cash/closings':1, 'sales-mode':1 }) return route.startsWith('settings/') ? 'settings' : 'home';
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
    navigateTo(parentRoute(current), { replace: true });
  };
  homeBtn.onclick = () => {
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
  if (!state.currentUser) return showLogin();
  if (route === 'home') { showHome(); enforceSingleActiveView(route); return; }
  if (route === 'stock') { showStockPage(); enforceSingleActiveView(route); return; }
  if (route === 'warehouse' || route === 'warehouse/gestion' || route === 'warehouse/movimientos' || route === 'warehouse/movimientos/archivados' || route.startsWith('warehouse/movimientos/archivados/')) { showWarehousePage(); enforceSingleActiveView(route); return; }
  if (route === 'settings') {
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
  settingsMenuCard?.classList.remove('hidden');
}

function saveMainSettings() {
  if (!hasPermission('accessSettings')) return setMsg(homeMessage, 'No tienes permiso para configurar pantalla principal.', false);
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
  state.settings.ordersEnabled = Boolean(tempConfig.activarPedidos);
  state.stockConfig.enabled = Boolean(tempConfig.stockActivo);
  state.stockConfig.min = Math.max(0, Number(stockMinInput?.value || 0));
  syncAppConfig();
  const file = logoInput?.files?.[0];
  if (!file) {
    persist();
    applySettings();
    renderOrdersVisibility();
    return setMsg(homeMessage, 'Configuración guardada.');
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.settings.logoDataUrl = String(reader.result || '');
    persist();
    applySettings();
    renderOrdersVisibility();
    setMsg(homeMessage, 'Configuración guardada.');
    if (logoInput) logoInput.value = '';
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
  });
  paymentType?.addEventListener('change', () => {
    const t = paymentType.value;
    cashPaymentFields?.classList.toggle('hidden', t !== 'efectivo');
    mixedFields?.classList.toggle('hidden', t !== 'mixto');
    debtFields?.classList.toggle('hidden', t !== 'deuda');
    partialFields?.classList.toggle('hidden', t !== 'medio_pago');
    renderCart();
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
  enableStockBtn?.addEventListener('click', () => { tempConfig.stockActivo = true; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Stock ACTIVADO'; });
  disableStockBtn?.addEventListener('click', () => { tempConfig.stockActivo = false; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Stock DESACTIVADO'; });
  enableOrdersBtn?.addEventListener('click', () => { tempConfig.activarPedidos = true; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Pedidos ACTIVADOS'; });
  disableOrdersBtn?.addEventListener('click', () => { tempConfig.activarPedidos = false; if (salesConfigStatus) salesConfigStatus.textContent = 'Cambio pendiente: Pedidos DESACTIVADOS'; });
  applySalesConfigBtn?.addEventListener('click', () => saveMainSettings());
  openDatabaseConfigBtn?.classList.add('hidden');
  syncNowBtn?.addEventListener('click', async () => { await syncToCloud(); if (syncStatus) syncStatus.textContent = 'Sincronizado con Firebase.'; });
  backFromMainConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromUsersConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromDatabaseConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
  backFromSalesConfigBtn?.addEventListener('click', () => navigateTo(parentRoute(normalizeRoute(window.location.hash || '#home')), { replace: true }));
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
    const delImg = e.target.closest('button[data-prod-img-del]');
    if (delImg) {
      const p = state.products.find((x) => x.id === delImg.dataset.prodImgDel);
      if (!p) return;
      const previous = p.imageDataUrl;
      delete p.imageDataUrl;
      imageDbDelete(imageRefKey(previous));
      const ok = persistImageChange(() => { p.imageDataUrl = previous; });
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
    const imgDelBtn = e.target.closest('button[data-cat-img-del]');
    if (imgDelBtn) { const key = imgDelBtn.dataset.catImgDel || ''; const previous = state.categoryImages[key] || ''; delete state.categoryImages[key]; imageDbDelete(imageRefKey(previous)); const ok = persistImageChange(() => { if (previous) state.categoryImages[key] = previous; }); if (!ok) return; renderProducts(); renderTouchSaleUi(); return; }
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
      state.cashClosings = state.cashClosings.filter((c) => c.id !== del.dataset.closingDel);
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
  normalizeCloudSettings();
  await pullFromCloud({ force: true });
  ensureUsers();
  ensureSeedData();
  ensureProductStockDefaults();
  normalizePeopleData();
  ensurePeopleData();
  if (!state.userSalesModes || typeof state.userSalesModes !== 'object') state.userSalesModes = {};
  if (!state.touchUiConfigByUser || typeof state.touchUiConfigByUser !== 'object') state.touchUiConfigByUser = {};
  if (!state.categoryImages || typeof state.categoryImages !== 'object') state.categoryImages = {};
  normalizeWarehouseData();
  normalizeDebtPaymentsData();
  normalizeCashState();
  syncAppConfig();
  saveLocalState();
  applySettings();
  ensureSalesModeButton();
  wireEvents();
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
  window.addEventListener('storage', (e) => { if (!e.key || !e.key.startsWith('cafeteria_')) return; pullFromCloud(); });
  window.addEventListener('hashchange', () => { if (applyingRoute) return; applyRoute(); });
  setInterval(pullFromCloud, 5000);
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
