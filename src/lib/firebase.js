// طبقة الاتصال بـ Firebase.
// القيم تُقرأ من متغيرات البيئة (ملف .env) ولا تُكتب هنا مباشرة أبداً،
// حتى لا تُرفع مفاتيح المشروع بشكل ثابت داخل الكود على GitHub.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// تفعيل التخزين المحلي الدائم لـ Firestore: يبقي آخر بيانات تمّت قراءتها
// متاحة للعرض حتى بلا اتصال بالإنترنت، ويُزامن أي تعديل أُجري بلا اتصال
// تلقائياً بمجرد عودة الشبكة. persistentMultipleTabManager يسمح بفتح
// التطبيق في أكثر من تبويب/نافذة معاً دون تعارض.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
