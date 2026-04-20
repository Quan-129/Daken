
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Attempt to find the broken section
target_start = "}, { onConflict: 'user_id,unit_idx,session_idx,study_mode' });"
# We expect public getN2SessionProgress to be next, but after some missing braces
target_next = "public getN2SessionProgress"

replacement_block = """}, { onConflict: 'user_id,unit_idx,session_idx,study_mode' });
              
              if (error) console.error('[StateManager] Lỗi lưu Cloud:', error.message);
              
              // [LEADERBOARD SYNC] Cập nhật ngay chỉ số tổng hợp lên Profile khi vừa có điểm mới
              this.eventBus.publish('HUB_DATA_LOADED', null); 
          }
      }
  }

  public getN2SessionProgress"""

# Find where it's broken
idx_start = content.find(target_start)
idx_next = content.find(target_next)

if idx_start != -1 and idx_next != -1:
    new_content = content[:idx_start] + replacement_block + content[idx_next + len(target_next):]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully repaired StateManager.ts sync logic and fixed braces.")
else:
    print(f"Indices: start={idx_start}, next={idx_next}")
