
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                const { data: { user } } = await supabase.auth.getUser();
                const userEmail = user?.email || 'guest@cyber-zen.io';

                // Lưu vào database (Yêu cầu bảng 'feedbacks' đã tồn tại)"""

replacement = """                const { data: { user } } = await supabase.auth.getUser();
                const userEmail = user?.email || 'guest@cyber-zen.io';
                const auth = AuthSystem.getInstance();
                const userProfile = auth.getCurrentUser();
                const displayName = userProfile?.name || localStorage.getItem('DAKEN_NAME') || 'Unknown Ronin';

                // Lưu vào database (Yêu cầu bảng 'feedbacks' đã tồn tại)"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully patched UISystem.ts for displayName fix")
else:
    print("Target block not found. Checking current state...")
    print(content[content.find("userEmail = user?.email || 'guest@cyber-zen.io';"):content.find("// Lưu vào database")])
