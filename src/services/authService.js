import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../lib/firebase.js'

// يضمن وجود جلسة Firebase Anonymous Auth نشطة قبل أي قراءة/كتابة في Firestore.
// هذا مستقل تماماً عن رمز PIN: الأخير قفل واجهة فقط، بينما هذا هو ما تتحقق
// منه قواعد الأمان الفعلية في Firestore (request.auth != null).
export function ensureAnonymousAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe()
        if (user) {
          resolve(user)
          return
        }
        try {
          const credential = await signInAnonymously(auth)
          resolve(credential.user)
        } catch (err) {
          reject(err)
        }
      },
      reject,
    )
  })
}
