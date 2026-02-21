import { requestClient } from '#/api/request';

/**
 * ==========================================
 * TYPES & INTERFACES
 * ==========================================
 */

// Online Customer Service Types
export interface OnlineCustomerServiceConfig {
  id?: number;
  brandId?: string;
  skipMessageCenter: boolean;
  onlineServiceEnabled: boolean;
  serviceLinkUrl?: string;
  openMethod?: 'APP_INTERNAL' | 'EXTERNAL_BROWSER';
  languageConfigs?: LanguageConfig[];
  h5FloatingEnabled: boolean;
  h5DisplayLocation?: 'ALL_PAGES' | 'HOME_ONLY';
  h5EmbedCode?: string;
  livechatEnabled: boolean;
  livechatBrandIds?: string[];
  livechatDisplayLocation?: 'ALL_PAGES' | 'HOME_ONLY';
  livechatGroupId?: string;
  livechatLicenseId?: string;
  imConfigs?: CustomerServiceIMConfig[]; // Include IM configs with generated links
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LanguageConfig {
  language: string;
  serviceName: string;
}

// Customer Service (IM) Types
export interface CustomerServiceIMConfig {
  id?: number;
  currencies?: string[];
  memberLevels?: string[];
  imType: 'LINE' | 'TELEGRAM' | 'WECHAT' | 'WHATSAPP' | 'SKYPE' | 'FACEBOOK' | 'CUSTOM';
  customImIcon?: string;
  serviceName: string;
  serviceAccount: string;
  androidLink?: string;
  iosLink?: string;
  pcLink?: string;
  generatedLink?: string; // Auto-generated link for display
  displayOrder: number;
  isEnabled: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// FAQ Types
export interface FAQCategory {
  id?: number;
  language: string;
  categoryName: string;
  icon?: string;
  displayOrder: number;
  _count?: {
    faqs: number;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQ {
  id?: number;
  categoryId: number;
  faqType: 'REGISTRATION' | 'RECHARGE' | 'WITHDRAWAL' | 'GAME' | 'BETTING' | 'COMMON' | 'OTHER';
  language: string;
  question: string;
  answer: string;
  videoUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  displayOrder: number;
  category?: FAQCategory;
  createdBy?: string;
  updatedBy?: string;
  publishedBy?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ==========================================
 * ONLINE CUSTOMER SERVICE APIs
 * ==========================================
 */

/**
 * Get online customer service configuration
 */
export async function getOnlineCustomerServiceConfig(brandId?: string) {
  const params = brandId ? { brandId } : {};
  return requestClient.get<OnlineCustomerServiceConfig>('/customer-service/online/config', { params });
}

/**
 * Update or create online customer service configuration
 */
export async function updateOnlineCustomerServiceConfig(config: OnlineCustomerServiceConfig) {
  return requestClient.post<OnlineCustomerServiceConfig>('/customer-service/online/config', config);
}

/**
 * ==========================================
 * OTHER CUSTOMER SERVICE (IM) APIs
 * ==========================================
 */

/**
 * Get all customer service IM configurations
 */
export async function getCustomerServiceIMConfigs() {
  return requestClient.get<CustomerServiceIMConfig[]>('/customer-service/im-configs');
}

/**
 * Get single customer service IM configuration
 */
export async function getCustomerServiceIMConfigById(id: number) {
  return requestClient.get<CustomerServiceIMConfig>(`/customer-service/im-configs/${id}`);
}

/**
 * Create customer service IM configuration
 */
export async function createCustomerServiceIMConfig(config: CustomerServiceIMConfig) {
  return requestClient.post<CustomerServiceIMConfig>('/customer-service/im-configs', config);
}

/**
 * Update customer service IM configuration
 */
export async function updateCustomerServiceIMConfig(id: number, config: CustomerServiceIMConfig) {
  return requestClient.put<CustomerServiceIMConfig>(`/customer-service/im-configs/${id}`, config);
}

/**
 * Delete customer service IM configuration
 */
export async function deleteCustomerServiceIMConfig(id: number) {
  return requestClient.delete(`/customer-service/im-configs/${id}`);
}

/**
 * Batch update display order for IM configs
 */
export async function updateCustomerServiceIMConfigsOrder(orders: { id: number; displayOrder: number }[]) {
  return requestClient.post('/customer-service/im-configs/reorder', { orders });
}

/**
 * ==========================================
 * FAQ APIs
 * ==========================================
 */

// FAQ Categories
/**
 * Get all FAQ categories
 */
export async function getFAQCategories(language?: string) {
  const params = language ? { language } : {};
  return requestClient.get<FAQCategory[]>('/customer-service/faq-categories', { params });
}

/**
 * Create FAQ category
 */
export async function createFAQCategory(category: FAQCategory) {
  return requestClient.post<FAQCategory>('/customer-service/faq-categories', category);
}

/**
 * Update FAQ category
 */
export async function updateFAQCategory(id: number, category: FAQCategory) {
  return requestClient.put<FAQCategory>(`/customer-service/faq-categories/${id}`, category);
}

/**
 * Delete FAQ category
 */
export async function deleteFAQCategory(id: number) {
  return requestClient.delete(`/customer-service/faq-categories/${id}`);
}

/**
 * Upload FAQ category icon to CDN
 */
export async function uploadFAQCategoryIcon(categoryId: number, file: File) {
  const formData = new FormData();
  formData.append('icon', file);
  
  return requestClient.post<{
    iconUrl: string;
    thumbnailUrl?: string;
    processingTime?: number;
    category: FAQCategory;
  }>(`/customer-service/faq-categories/${categoryId}/upload-icon`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// FAQs
/**
 * Get all FAQs with filtering
 */
export async function getFAQs(filters?: {
  language?: string;
  categoryId?: number;
  faqType?: string;
  status?: string;
  search?: string;
}) {
  return requestClient.get<FAQ[]>('/customer-service/faqs', { params: filters });
}

/**
 * Get single FAQ by ID
 */
export async function getFAQById(id: number) {
  return requestClient.get<FAQ>(`/customer-service/faqs/${id}`);
}

/**
 * Create FAQ
 */
export async function createFAQ(faq: FAQ) {
  return requestClient.post<FAQ>('/customer-service/faqs', faq);
}

/**
 * Update FAQ
 */
export async function updateFAQ(id: number, faq: FAQ) {
  return requestClient.put<FAQ>(`/customer-service/faqs/${id}`, faq);
}

/**
 * Delete FAQ
 */
export async function deleteFAQ(id: number) {
  return requestClient.delete(`/customer-service/faqs/${id}`);
}

/**
 * Publish FAQ
 */
export async function publishFAQ(id: number) {
  return requestClient.post<FAQ>(`/customer-service/faqs/${id}/publish`);
}

/**
 * Unpublish FAQ
 */
export async function unpublishFAQ(id: number) {
  return requestClient.post<FAQ>(`/customer-service/faqs/${id}/unpublish`);
}

/**
 * Batch update FAQ display order
 */
export async function updateFAQsOrder(orders: { id: number; displayOrder: number }[]) {
  return requestClient.post('/customer-service/faqs/reorder', { orders });
}

