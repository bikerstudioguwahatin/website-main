// admin/api.ts

import { ApiResponse } from './types';

const API_BASE_URL = '/api/admin';

export const api = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
  
  async fetchData<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
  
  async saveData<T>(endpoint: string, data: any, method: 'POST' | 'PUT' = 'POST'): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log('=== API SAVE DEBUG ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Data:', JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        console.error('Save failed:', responseData);
        throw new Error(responseData.error || responseData.details || 'Save failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  },
  
  async deleteData(endpoint: string, id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },
  
  async bulkImport(type: string, file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch(`${API_BASE_URL}/bulk-import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  },

  async downloadTemplate(type: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${type}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Template download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download error:', error);
      throw error;
    }
  }
};