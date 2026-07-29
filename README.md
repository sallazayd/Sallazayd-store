# سلة زايد — متجر إلكتروني

متجر إلكتروني عربي (RTL) مبني بـ Next.js 14 + TypeScript + Tailwind CSS + Firebase.
هذا متجر واحد يخص علامة "سلة زايد" فقط (ليس منصة أو Website Builder).

## المميزات

- واجهة عربية بالكامل RTL بتصميم بسيط فاخر (أبيض / أسود / رمادي).
- الصفحة الرئيسية: الشعار، اسم المتجر، شريط بحث، قسم "الأكثر مبيعاً"، شبكة المنتجات.
- صفحة منتج: صور متعددة، ألوان قابلة للاختيار كدوائر، محدد كمية، إضافة للعربة.
- عربة تسوق كاملة (إضافة / حذف / تعديل الكمية / الإجمالي).
- صفحة إتمام طلب (الاسم، الهاتف، المحافظة، العنوان، ملاحظات).
- كل طلب يُحفظ في Firestore مع كل تفاصيله وتاريخه وحالته.
- لوحة تحكم إدارية محمية بتسجيل دخول Firebase Authentication:
  - إدارة المنتجات (إضافة / تعديل / حذف / صور متعددة / ألوان / أكثر مبيعاً).
  - إدارة الطلبات (بحث، فلترة، تغيير الحالة: قيد الانتظار، تم التأكيد، قيد التجهيز، تم التوصيل، ملغي).
  - الإعدادات (اسم المتجر، الشعار، شريط الإعلانات).

## هيكل المشروع

```
src/
  app/                  # صفحات Next.js (App Router)
    page.tsx            # الصفحة الرئيسية
    product/[id]/        # صفحة المنتج
    cart/                # عربة التسوق
    checkout/            # إتمام الطلب
    order-success/[id]/  # تأكيد الطلب
    admin/               # لوحة التحكم (محمية)
  components/           # المكونات المشتركة
  context/               # Cart + Auth context
  lib/                   # Firebase config + types + utils
firestore.rules          # قواعد أمان قاعدة البيانات
storage.rules             # قواعد أمان التخزين
firebase.json              # إعدادات Firebase Hosting
```

---

## الخطوة 1: تجهيز مشروع Firebase

1. اذهب إلى https://console.firebase.google.com وأنشئ مشروعاً جديداً (مثال: `salla-zayed`).
2. من القائمة الجانبية فعّل الخدمات التالية:
   - **Authentication** → تبويب "Sign-in method" → فعّل "Email/Password".
   - **Firestore Database** → أنشئ قاعدة بيانات (ابدأ في وضع Production).
   - **Storage** → فعّل التخزين لحفظ صور المنتجات والشعار.
3. من "Project settings" → "Your apps" → أضف تطبيق ويب (</>) وانسخ بيانات `firebaseConfig`.
4. أنشئ أول مستخدم أدمن من Authentication → Users → Add user (هذا البريد وكلمة المرور هما بيانات دخول لوحة التحكم).

## الخطوة 2: إعداد المشروع محلياً

```bash
# تثبيت الاعتماديات
npm install

# انسخ ملف البيئة وعبّئ بيانات Firebase
cp .env.local.example .env.local
```

افتح `.env.local` وضع القيم التي نسختها من Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

ثم شغّل المشروع محلياً:

```bash
npm run dev
```

افتح `http://localhost:3000` للمتجر، و `http://localhost:3000/admin/login` للوحة التحكم.

## الخطوة 3: نشر قواعد الأمان (Firestore + Storage)

```bash
npm install -g firebase-tools
firebase login

# ضع معرف مشروعك بدل REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID في .firebaserc
firebase use --add        # اختر مشروعك واربطه كـ "default"
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## الخطوة 4: النشر على Firebase Hosting

المشروع يحتوي صفحات ديناميكية تُقرأ من Firestore بمعرّفات غير معروفة عند البناء
(`/product/[id]`, `/admin/products/[id]/edit`, `/order-success/[id]`)، لذلك يُنشر عبر
**Firebase App Hosting** (يدعم Next.js App Router بالكامل مع SSR)، وليس Hosting الكلاسيكي (الثابت):

```bash
firebase init apphosting
```

أثناء التهيئة:
1. اختر مشروع Firebase الذي أنشأته.
2. اربط مستودع GitHub الذي يحتوي هذا الكود (أو ادفع الكود إلى مستودع جديد أولاً).
3. اترك ملف `apphosting.yaml` الموجود بالفعل في المشروع كما هو — يحتوي أسماء متغيرات البيئة اللازمة.
4. في Firebase Console → App Hosting → Backend → **Environment variables**، أضف القيم الفعلية لكل متغير من `NEXT_PUBLIC_FIREBASE_...` (نفس القيم في `.env.local`).

بعد الربط، كل Push إلى الفرع الرئيسي يبني وينشر نسخة جديدة تلقائياً. يمكنك أيضاً تشغيل نشر يدوي من نفس الشاشة في Console.

> `firebase.json` في هذا المشروع يحتوي فقط على قواعد Firestore/Storage — لا حاجة لأي مفتاح "hosting" فيه لأن App Hosting يُدار عبر `apphosting.yaml` وربط GitHub مباشرة.

## الخطوة 5: ربط دومين مخصص (مثال: sallazayd.com)

1. من Firebase Console → Hosting (أو App Hosting) → **Add custom domain**.
2. اكتب الدومين: `sallazayd.com` (وإن أردت `www.sallazayd.com` أيضاً).
3. سيعطيك Firebase سجلات DNS (عادة نوع `A` أو `TXT` للتحقق، ثم سجلات توجيه).
4. ادخل إلى لوحة تحكم مزود الدومين (مثل Namecheap أو GoDaddy) → DNS Settings.
5. أضف السجلات كما هي بالضبط كما يعرضها Firebase.
6. انتظر انتشار DNS (قد يستغرق من دقائق إلى 48 ساعة).
7. سيصدر Firebase شهادة SSL تلقائياً للدومين بعد التحقق، ليعمل الموقع عبر `https://sallazayd.com`.

---

## إضافة أول منتج

1. سجّل الدخول إلى `/admin/login` بالبريد وكلمة المرور اللذين أنشأتهما في Authentication.
2. من القائمة اختر **المنتجات** → **إضافة منتج**.
3. ارفع الصور، اكتب الاسم والسعر والوصف، أضف الألوان إن وُجدت، وفعّل "الأكثر مبيعاً" إذا رغبت بذلك.
4. احفظ — يظهر المنتج فوراً في المتجر دون الحاجة لأي تعديل بالكود.

## التوسعة المستقبلية

هيكل المشروع مُعد لإضافة لاحقة لِـ:
- بوابات دفع إلكتروني (يُضاف كخطوة إضافية داخل `checkout/page.tsx`).
- شركات شحن (ربط API لحساب تكلفة الشحن حسب المحافظة).
- إشعارات (SMS / WhatsApp Business API عند تغيّر حالة الطلب).
- أكواد خصم (كوبونات) — إضافة collection جديد `coupons` في Firestore.
- المفضلة (Wishlist) وتقييمات المنتجات (Reviews).
