import http from './api'

// api/digitalMenuService.js
export const digitalMenuService = {
  getDigitalMenus(branchSlug, tableId) {
    const url = tableId
      ? `v1/public/menu/${branchSlug}/table/${tableId}`
      : `v1/public/menu/${branchSlug}`

    return http.get(url)
  }
}
