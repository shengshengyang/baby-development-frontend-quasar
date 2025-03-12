// src/utils/navigation.ts
import type { Router } from 'vue-router'

/**
 * Safely navigate to another route with error handling
 * @param router Vue Router instance
 * @param path Route path or location object
 * @param options Optional - replace current history entry
 * @returns Promise<void>
 */
export async function safeNavigate(
  router: Router,
  path: string | { name: string, params?: Record<string, string> },
  options?: { replace?: boolean }
): Promise<void> {
  try {
    if (options?.replace) {
      await router.replace(path)
    } else {
      await router.push(path)
    }
  } catch (error) {
    // Ignore navigation duplicated errors as they are expected in some cases
    if (error instanceof Error && error.toString().includes('Navigation cancelled')) {
      console.info('Navigation cancelled (this is normal if navigating to the same route)')
      return
    }
    console.error('Navigation failed:', error)
  }
}
