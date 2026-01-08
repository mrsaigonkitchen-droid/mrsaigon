# 🚀 Hướng dẫn Deploy NỘI THẤT NHANH lên Google Cloud

## 📋 Tổng quan Architecture

| App | Service | Google Service | Chi phí ước tính |
|-----|---------|----------------|------------------|
| `api/` | Backend Hono | Cloud Run | ~$5-20/tháng |
| `landing/` | Public website | Cloud Run | ~$0-5/tháng |
| `admin/` | Admin dashboard | Cloud Run | ~$0-5/tháng |
| `portal/` | User portal | Cloud Run | ~$0-5/tháng |
| Database | PostgreSQL | Cloud SQL | ~$10-30/tháng |
| Media | File storage | Cloud Storage | ~$1-5/tháng |
| Cache | Redis | Memorystore | ~$30/tháng (optional) |

> **Tổng chi phí ước tính**: $20-70/tháng (tùy traffic)

---

## 🛠️ Bước 1: Cài đặt công cụ

### 1.1 Cài Google Cloud CLI

**Windows (PowerShell):**
```powershell
# Download và cài đặt từ
# https://cloud.google.com/sdk/docs/install

# Hoặc dùng winget
winget install Google.CloudSDK
```

**Verify:**
```bash
gcloud --version
```

### 1.2 Login và tạo Project

```bash
# Login
gcloud auth login

# Tạo project mới
gcloud projects create noi-that-nhanh --name="Noi That Nhanh"

# Set project mặc định
gcloud config set project noi-that-nhanh

# Enable billing (bắt buộc)
# Vào https://console.cloud.google.com/billing để link billing account
```

---

## 🚀 Bước 2: Setup Infrastructure

### 2.1 Chạy script setup tự động

```bash
# Từ thư mục root của project
chmod +x infra/gcp/setup.sh
./infra/gcp/setup.sh
```

Script sẽ tự động:
- Enable các APIs cần thiết
- Tạo Cloud SQL PostgreSQL
- Tạo Cloud Storage bucket
- Tạo Memorystore Redis (optional)
- Tạo Secrets trong Secret Manager
- Cấp quyền cho Cloud Run

### 2.2 Hoặc setup thủ công

```bash
# Enable APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

# Tạo Artifact Registry
gcloud artifacts repositories create ntn-repo \
  --repository-format=docker \
  --location=asia-southeast1

# Tạo Cloud SQL
gcloud sql instances create ntn-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1

# Tạo database
gcloud sql databases create ntn_production --instance=ntn-db

# Tạo user
gcloud sql users create ntn_user \
  --instance=ntn-db \
  --password=YOUR_SECURE_PASSWORD

# Tạo Storage bucket
gcloud storage buckets create gs://ntn-media-bucket \
  --location=asia-southeast1 \
  --uniform-bucket-level-access
```

---

## 🔗 Bước 3: Kết nối GitHub với Cloud Build

### 3.1 Kết nối Repository

1. Vào [Cloud Console > Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **"Connect Repository"**
3. Chọn **GitHub** → Authorize
4. Chọn repository của bạn
5. Click **"Connect"**

### 3.2 Tạo Build Triggers

**Trigger cho API:**
```bash
gcloud builds triggers create github \
  --name="ntn-api-trigger" \
  --repo-name="noi-that-nhanh" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --included-files="api/**,packages/**,infra/prisma/**" \
  --build-config="infra/gcp/cloudbuild-api.yaml"
```

**Trigger cho Landing:**
```bash
gcloud builds triggers create github \
  --name="ntn-landing-trigger" \
  --repo-name="noi-that-nhanh" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --included-files="landing/**,packages/**" \
  --build-config="infra/gcp/cloudbuild-landing.yaml"
```

**Trigger cho Admin:**
```bash
gcloud builds triggers create github \
  --name="ntn-admin-trigger" \
  --repo-name="noi-that-nhanh" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --included-files="admin/**,packages/**" \
  --build-config="infra/gcp/cloudbuild-admin.yaml"
```

**Trigger cho Portal:**
```bash
gcloud builds triggers create github \
  --name="ntn-portal-trigger" \
  --repo-name="noi-that-nhanh" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --included-files="portal/**,packages/**" \
  --build-config="infra/gcp/cloudbuild-portal.yaml"
```

---

## 📤 Bước 4: Deploy lần đầu

### 4.1 Push code lên GitHub

```bash
git add .
git commit -m "Add GCP deployment configuration"
git push origin main
```

### 4.2 Kiểm tra build

1. Vào [Cloud Build > History](https://console.cloud.google.com/cloud-build/builds)
2. Xem logs của từng build
3. Đợi tất cả builds hoàn thành

### 4.3 Lấy URLs

```bash
# Xem danh sách services
gcloud run services list --region=asia-southeast1

# Output:
# SERVICE       REGION            URL
# ntn-api       asia-southeast1   https://ntn-api-xxxxx-as.a.run.app
# ntn-landing   asia-southeast1   https://ntn-landing-xxxxx-as.a.run.app
# ntn-admin     asia-southeast1   https://ntn-admin-xxxxx-as.a.run.app
# ntn-portal    asia-southeast1   https://ntn-portal-xxxxx-as.a.run.app
```

---

## 🔄 Bước 5: Update sau khi deploy

### 5.1 Workflow cập nhật code

```bash
# 1. Sửa code local
# 2. Test local
pnpm dev:api
pnpm dev:landing

# 3. Commit và push
git add .
git commit -m "feat: add new feature"
git push origin main

# 4. Cloud Build tự động trigger
# 5. Đợi 2-5 phút để deploy xong
```

### 5.2 Chỉ deploy 1 app cụ thể

```bash
# Trigger manual build cho API
gcloud builds triggers run ntn-api-trigger --branch=main

# Trigger manual build cho Landing
gcloud builds triggers run ntn-landing-trigger --branch=main
```

### 5.3 Rollback về version cũ

```bash
# Xem danh sách revisions
gcloud run revisions list --service=ntn-api --region=asia-southeast1

# Rollback về revision cụ thể
gcloud run services update-traffic ntn-api \
  --to-revisions=ntn-api-00005-abc=100 \
  --region=asia-southeast1
```

---

## 🌐 Bước 6: Custom Domain

### 6.1 Map domain cho Cloud Run

```bash
# Verify domain ownership trước
gcloud domains verify noithanhnhanh.vn

# Map domain
gcloud run domain-mappings create \
  --service=ntn-landing \
  --domain=noithanhnhanh.vn \
  --region=asia-southeast1

gcloud run domain-mappings create \
  --service=ntn-api \
  --domain=api.noithanhnhanh.vn \
  --region=asia-southeast1

gcloud run domain-mappings create \
  --service=ntn-admin \
  --domain=admin.noithanhnhanh.vn \
  --region=asia-southeast1

gcloud run domain-mappings create \
  --service=ntn-portal \
  --domain=portal.noithanhnhanh.vn \
  --region=asia-southeast1
```

### 6.2 Cập nhật DNS

Thêm các DNS records theo hướng dẫn từ Cloud Console:
- Type: CNAME
- Name: @ (hoặc subdomain)
- Value: ghs.googlehosted.com

---

## 🔐 Bước 7: Quản lý Secrets

### 7.1 Xem secrets

```bash
gcloud secrets list
```

### 7.2 Cập nhật secret

```bash
# Cập nhật JWT_SECRET
echo -n "new-jwt-secret-value" | gcloud secrets versions add JWT_SECRET --data-file=-

# Cập nhật DATABASE_URL
echo -n "postgresql://user:pass@host/db" | gcloud secrets versions add DATABASE_URL --data-file=-
```

### 7.3 Redeploy sau khi đổi secret

```bash
# Cloud Run cần redeploy để lấy secret mới
gcloud run services update ntn-api \
  --region=asia-southeast1 \
  --update-secrets=JWT_SECRET=JWT_SECRET:latest
```

---

## 📊 Bước 8: Monitoring

### 8.1 Xem logs

```bash
# Logs của API
gcloud run services logs read ntn-api --region=asia-southeast1 --limit=100

# Logs realtime
gcloud run services logs tail ntn-api --region=asia-southeast1
```

### 8.2 Cloud Console

- **Logs**: https://console.cloud.google.com/logs
- **Metrics**: https://console.cloud.google.com/run
- **Errors**: https://console.cloud.google.com/errors

---

## 🗄️ Bước 9: Database Migration

### 9.1 Chạy migration

```bash
# Kết nối Cloud SQL qua proxy
gcloud sql connect ntn-db --user=ntn_user --database=ntn_production

# Hoặc dùng Cloud SQL Proxy
./cloud-sql-proxy noi-that-nhanh:asia-southeast1:ntn-db &

# Chạy migration
DATABASE_URL="postgresql://ntn_user:PASSWORD@localhost:5432/ntn_production" pnpm db:push
```

### 9.2 Seed data

```bash
DATABASE_URL="postgresql://ntn_user:PASSWORD@localhost:5432/ntn_production" pnpm db:seed
```

---

## 💰 Tối ưu chi phí

### 10.1 Giảm chi phí Cloud SQL

```bash
# Dùng tier nhỏ hơn
gcloud sql instances patch ntn-db --tier=db-f1-micro

# Tắt backup (không khuyến khích cho production)
gcloud sql instances patch ntn-db --no-backup
```

### 10.2 Giảm chi phí Cloud Run

```yaml
# Trong cloudbuild-*.yaml
--min-instances=0  # Scale to zero khi không có traffic
--max-instances=3  # Giới hạn max instances
--memory=256Mi     # Giảm memory nếu đủ
```

### 10.3 Bỏ Redis (nếu không cần)

- Rate limiting có thể dùng in-memory (không persistent)
- Hoặc dùng Cloud Firestore cho rate limiting

---

## ❓ Troubleshooting

### Build failed

```bash
# Xem logs chi tiết
gcloud builds log BUILD_ID

# Rebuild
gcloud builds triggers run TRIGGER_NAME --branch=main
```

### Cloud Run không start

```bash
# Xem logs
gcloud run services logs read SERVICE_NAME --region=asia-southeast1

# Kiểm tra secrets
gcloud run services describe SERVICE_NAME --region=asia-southeast1
```

### Database connection failed

```bash
# Kiểm tra Cloud SQL đang chạy
gcloud sql instances describe ntn-db

# Kiểm tra connection name
gcloud sql instances describe ntn-db --format='value(connectionName)'
```

---

## 📊 Bước 10: Setup Google Integration (Sheets + Gmail)

Tính năng này cho phép:
- **Google Sheets**: Đồng bộ leads vào spreadsheet
- **Gmail**: Gửi email báo giá với PDF đính kèm

### 10.1 Tạo OAuth Credentials trên Google Cloud Console

1. Vào [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Chọn **"Web application"**
4. Đặt tên: `NỘI THẤT NHANH Integration`
5. Thêm **Authorized redirect URIs**:
   ```
   https://api.noithatnhanh.vn/integrations/google/callback
   ```
   ⚠️ **QUAN TRỌNG**: URI phải chính xác, bao gồm cả `/integrations/google/callback`
6. Click **"Create"** và copy **Client ID** + **Client Secret**

### 10.2 Enable APIs

```bash
gcloud services enable sheets.googleapis.com gmail.googleapis.com
```

### 10.3 Tạo Secrets trong Secret Manager

```bash
# Tạo encryption key (BẮT BUỘC cho mã hóa OAuth tokens)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Lưu vào Secret Manager
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-

# Nếu chưa có ENCRYPTION_KEY
echo -n "$ENCRYPTION_KEY" | gcloud secrets create ENCRYPTION_KEY --data-file=-

# Cấp quyền cho Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET ENCRYPTION_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$CLOUD_RUN_SA" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 10.4 Cập nhật Cloud Run

```bash
gcloud run services update ntn-api \
  --region=asia-southeast1 \
  --update-secrets="GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,ENCRYPTION_KEY=ENCRYPTION_KEY:latest" \
  --update-env-vars="GOOGLE_REDIRECT_URI=https://api.noithatnhanh.vn/integrations/google/callback,ADMIN_URL=https://admin.noithatnhanh.vn"
```

### 10.5 Cấu hình OAuth Consent Screen (nếu chưa có)

1. Vào [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Chọn **External** (hoặc Internal nếu dùng Google Workspace)
3. Điền thông tin:
   - App name: `NỘI THẤT NHANH`
   - User support email: email của bạn
   - Developer contact: email của bạn
4. Thêm scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/gmail.send`
5. Thêm test users (nếu app chưa được verify)

### 10.6 Kết nối trong Admin

1. Vào **Admin > Settings > Tích hợp**
2. Click **"Kết nối Google Sheets"**
3. Đăng nhập Google và cấp quyền
4. Sau khi redirect về, nhập **Spreadsheet ID** (lấy từ URL của Google Sheet)
5. Bật **"Tự động đồng bộ leads mới"**
6. Click **"Lưu cài đặt"**

### 10.7 Troubleshooting

**Lỗi "redirect_uri_mismatch":**
- Kiểm tra URI trong Google Console phải chính xác: `https://api.noithatnhanh.vn/integrations/google/callback`
- Không có trailing slash `/` ở cuối

**Lỗi "No refresh token received":**
- Vào [Google Account Permissions](https://myaccount.google.com/permissions)
- Revoke access cho app
- Thử kết nối lại

**Lỗi "Failed to connect":**
```bash
# Kiểm tra logs
gcloud run services logs read ntn-api --region=asia-southeast1 --limit=50 | grep -i google

# Kiểm tra secrets đã được mount
gcloud run services describe ntn-api --region=asia-southeast1 --format='yaml(spec.template.spec.containers[0].env)'
```

**Lỗi "Encryption key not configured":**
- Đảm bảo `ENCRYPTION_KEY` secret đã được tạo và mount vào Cloud Run

---

## 📁 Bước 11: Setup Cloud Storage cho Media

⚠️ **QUAN TRỌNG**: Cloud Run container sẽ mất tất cả files khi restart. Bạn PHẢI dùng Cloud Storage cho production!

### 11.1 Tạo Cloud Storage Bucket

```bash
# Tạo bucket
gcloud storage buckets create gs://ntn-media-bucket \
  --location=asia-southeast1 \
  --uniform-bucket-level-access \
  --public-access-prevention=inherited

# Cho phép public read (để serve media files)
gcloud storage buckets add-iam-policy-binding gs://ntn-media-bucket \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### 11.2 Tạo Service Account và HMAC Key

```bash
# Tạo service account cho storage
gcloud iam service-accounts create ntn-storage-sa \
  --display-name="NTN Storage Service Account"

# Lấy email của service account
SA_EMAIL="ntn-storage-sa@$(gcloud config get-value project).iam.gserviceaccount.com"

# Cấp quyền Storage Admin cho service account
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin"

# Tạo HMAC key
gcloud storage hmac create $SA_EMAIL

# Output sẽ có:
# accessId: GOOG1E...
# secret: ...
# ⚠️ LƯU LẠI 2 GIÁ TRỊ NÀY! Secret chỉ hiển thị 1 lần!
```

### 11.3 Thêm Secrets vào Secret Manager

```bash
# Thay YOUR_ACCESS_ID và YOUR_SECRET bằng giá trị từ bước 11.2

# Tạo secrets
echo -n "ntn-media-bucket" | gcloud secrets create s3-bucket --data-file=-
echo -n "asia-southeast1" | gcloud secrets create s3-region --data-file=-
echo -n "https://storage.googleapis.com" | gcloud secrets create s3-endpoint --data-file=-
echo -n "GOOG1E_YOUR_ACCESS_ID" | gcloud secrets create s3-access-key-id --data-file=-
echo -n "YOUR_SECRET_KEY" | gcloud secrets create s3-secret-access-key --data-file=-
echo -n "https://storage.googleapis.com/ntn-media-bucket" | gcloud secrets create s3-public-url --data-file=-

# Cấp quyền cho Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in s3-bucket s3-region s3-endpoint s3-access-key-id s3-secret-access-key s3-public-url; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$CLOUD_RUN_SA" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 11.4 Cập nhật Cloud Run với Storage Secrets

```bash
gcloud run services update ntn-api \
  --region=asia-southeast1 \
  --update-secrets="S3_BUCKET=s3-bucket:latest,S3_REGION=s3-region:latest,S3_ENDPOINT=s3-endpoint:latest,S3_ACCESS_KEY_ID=s3-access-key-id:latest,S3_SECRET_ACCESS_KEY=s3-secret-access-key:latest,S3_PUBLIC_URL=s3-public-url:latest" \
  --update-env-vars="S3_FORCE_PATH_STYLE=true"
```

### 11.5 Kiểm tra Storage

```bash
# Xem logs để verify storage type
gcloud run services logs read ntn-api --region=asia-southeast1 --limit=20 | grep -i storage

# Nên thấy: "Using S3/R2 storage" thay vì "Using local filesystem storage"

# Hoặc gọi API endpoint (cần auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ntn-api-xxxxx-as.a.run.app/media/storage-info
```

### 11.6 Migrate Media Files (nếu có)

Nếu bạn đã có media files trên local, cần upload lên Cloud Storage:

```bash
# Upload tất cả files từ .media folder
gsutil -m cp -r .media/* gs://ntn-media-bucket/

# Hoặc dùng gcloud storage
gcloud storage cp -r .media/* gs://ntn-media-bucket/
```

### 11.7 Cấu hình CORS cho Bucket (nếu cần)

```bash
# Tạo file cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["https://noithatnhanh.vn", "https://admin.noithatnhanh.vn", "https://portal.noithatnhanh.vn"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS config
gcloud storage buckets update gs://ntn-media-bucket --cors-file=cors.json
```

### 11.8 Tối ưu với Cloud CDN (Optional)

Để tăng tốc độ load media files:

```bash
# Tạo backend bucket
gcloud compute backend-buckets create ntn-media-backend \
  --gcs-bucket-name=ntn-media-bucket \
  --enable-cdn

# Tạo URL map
gcloud compute url-maps create ntn-media-lb \
  --default-backend-bucket=ntn-media-backend

# Tạo HTTPS proxy (cần SSL certificate)
# Xem thêm: https://cloud.google.com/cdn/docs/setting-up-cdn-with-bucket
```

---

## 📁 File Structure

```
infra/
├── docker/
│   ├── api.Dockerfile        # Dockerfile cho API
│   ├── frontend.Dockerfile   # Dockerfile cho Landing/Admin/Portal
│   └── nginx.conf            # Nginx config cho SPA
├── gcp/
│   ├── setup.sh              # Script setup GCP resources
│   ├── setup-google-integration.sh  # Script setup Google OAuth
│   ├── deploy-manual.sh      # Script deploy thủ công
│   ├── cloudbuild-api.yaml   # Cloud Build config cho API
│   ├── cloudbuild-landing.yaml
│   ├── cloudbuild-admin.yaml
│   └── cloudbuild-portal.yaml
└── prisma/
    └── schema.prisma         # Database schema
```


