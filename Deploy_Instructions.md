# دليل الرفع على منصات Netlify و SmarterASP

هذا الدليل هيساعدك ترفع المشروع خطوة بخطوة.

## أولاً: رفع الواجهة الأمامية (Frontend) على Netlify

ملف `netlify.toml` مجهز بالفعل في المشروع وبيحتوي على الإعدادات الصح.

1. ادخل على حسابك في [Netlify](https://www.netlify.com/).
2. اختار **Add new site** ثم **Deploy manually** (لو هترفع الملفات يدوي) أو **Import from Git** (لو هتربط بـ GitHub).
3. **لو هترفع يدوي:**
   - افتح الـ Terminal واعمل Build للمشروع:
     ```bash
     cd "d:\Backend\SYSTEM CHMESTRY\lab-inventory-client"
     npm run build
     ```
   - ارفع مجلد `dist` اللي هيظهر جوه `lab-inventory-client` على Netlify.
4. **لو هتربط بـ GitHub:**
   - Build Command: `npm run build`
   - Publish directory: `dist`
5. **خطوة مهمة جداً (Environment Variables):**
   - في إعدادات الـ Site في Netlify (Site settings > Environment variables).
   - ضيف متغير جديد اسمه `VITE_API_URL`.
   - قيمته هتكون رابط الـ API بتاعك على SmarterASP (مثلاً `http://your-domain.com/api`).

---

## ثانياً: رفع الـ Backend (API) على SmarterASP

1. افتح الـ Terminal واعمل Publish للـ Backend:
   ```bash
   cd "d:\Backend\SYSTEM CHMESTRY"
   dotnet publish -c Release -o ./publish
   ```
2. هيتكون عندك مجلد جديد اسمه `publish`، اضغط كل الملفات اللي جواه في ملف `publish.zip`.
3. ادخل على لوحة تحكم [SmarterASP.net](https://www.smarterasp.net/) واعمل قاعدة بيانات SQL جديدة واحتفظ بـ **Connection String**.
4. ادخل على الـ **File Manager** في SmarterASP وارفع ملف `publish.zip` واعمله استخراج (Extract) في مسار الموقع بتاعك.
5. افتح ملف `appsettings.json` اللي رفعته من خلال مدير الملفات في SmarterASP وعدّل الـ `DefaultConnection` عشان تحط الـ Connection String الجديد بتاع قاعدة البيانات.
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=SQL5XXX.site4now.net;Database=DB_XXXXX;User Id=XXXXX;Password=XXXXX;"
   }
   ```
6. السيرفر عندك متبرمج إنه يعمل الجداول التلقائية بمجرد تشغيله (عن طريق `db.Database.EnsureCreated();`) فهتلاقي الجداول اتعملت بمجرد ما تفتح الموقع لأول مرة، وتم إنشاء 4 حسابات أدمن تلقائياً.
