lines = open('main.py', 'r', encoding='utf-8').readlines()
# Insert the missing except clause after line 432
except_clause = """    except Exception as e:
        logger.error(f"Error fetching selected candidates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch selected candidates")

"""
lines.insert(432, except_clause)
open('main.py', 'w', encoding='utf-8').writelines(lines)
print("Fixed!")
