# 🚀 GitHub Push Instructions

## Step 1: Create Private Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository settings:**
   - **Owner**: sunildta
   - **Repository name**: `ai-resume-ranker`
   - **Description**: AI-powered resume ranking and candidate management system
   - **Visibility**: ⚠️ **PRIVATE** (Important!)
   - **DO NOT** initialize with README, .gitignore, or license (we already have them)
3. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, run these commands in your terminal:

```bash
# Navigate to project directory
cd "C:\Users\Sunil Yadav\Desktop\ai-resume-ranker"

# Add GitHub remote (replace YOUR_USERNAME if different)
git remote add origin https://github.com/sunildta/ai-resume-ranker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify Security

After pushing, verify on GitHub that these files are NOT visible:

❌ `backend/firebase_key.json` - Should NOT be there
❌ `backend/.env` - Should NOT be there
❌ `backend/uploads/*` (user files) - Should NOT be there

✅ `backend/firebase_key.json.example` - Should be there (template)
✅ `backend/.env.example` - Should be there (template)
✅ `README.md` - Should be there
✅ `.gitignore` - Should be there

## ✅ What's Already Done

- ✅ Git initialized
- ✅ `.gitignore` created (excludes all sensitive files)
- ✅ `.env.example` created (template without real keys)
- ✅ `firebase_key.json.example` created (template)
- ✅ `README.md` created (full documentation)
- ✅ All changes committed locally
- ✅ Ready to push!

## 🔒 Security Checklist

Your credentials are safe because:

1. ✅ `firebase_key.json` is in `.gitignore`
2. ✅ `.env` is in `.gitignore`
3. ✅ `backend/uploads/` is in `.gitignore`
4. ✅ Only template files (`.example`) are committed
5. ✅ Repository will be PRIVATE

## 📝 Future Commits

When you make changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The `.gitignore` will automatically exclude sensitive files!

## ⚠️ Important Notes

- **NEVER** remove `.gitignore`
- **NEVER** run `git add -f firebase_key.json` (forces adding ignored file)
- Always keep repository **PRIVATE**
- Share `.example` files with collaborators, not actual credentials

## 🆘 If You Accidentally Pushed Credentials

If you accidentally pushed credentials, immediately:

1. **Rotate your keys** (generate new ones in Firebase/Gemini)
2. Remove from Git history: 
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/firebase_key.json" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. Update `.gitignore` to prevent it happening again

---

**Ready to push!** Just run the commands in Step 2 above.
