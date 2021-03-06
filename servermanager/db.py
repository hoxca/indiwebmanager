import sqlite3, json, os

dirname, filename = os.path.split(os.path.abspath(__file__))

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

conn = sqlite3.connect(dirname+"/profiles.db")
conn.row_factory = dict_factory

# Get all profiles from database        
def get_profiles():
    cursor = conn.execute("SELECT * FROM profile")
    results = cursor.fetchall()    
    return results

# Get all drivers for a specific profile from database
def get_profile_drivers(profile_name):
    cursor     = conn.execute("SELECT label FROM driver WHERE profile=(SELECT id FROM profile WHERE name='" + profile_name + "')")
    results = cursor.fetchall()
    return results

# Delete Profile
def delete_profile(profile_name):
    cursor = conn.cursor();    
    try:
        conn.execute("DELETE FROM driver WHERE profile=(SELECT id FROM profile WHERE name='" + profile_name + "')")
        conn.execute("DELETE FROM profile WHERE name='" + profile_name + "'");        
    except Exception:
        return "Error deleting profile";
    else:
        conn.commit();
        
# Add Profile
def add_profile(profile_name):
    try:
        cursor = conn.cursor();
        conn.execute("INSERT INTO profile (name) VALUES('" + profile_name + "')");
    except Exception:
        return "Error adding profile. Profile already exists."
    else:
        conn.commit();
        
# Save profile drivers
def save_profile_drivers(profile_name, drivers):
    cursor = conn.cursor();    
    cursor = conn.execute("SELECT id FROM profile WHERE name='" + profile_name + "'");
    profile_id = cursor.fetchone()['id'];
    cursor = conn.execute("DELETE FROM driver WHERE profile =" + str(profile_id));
    for driver in drivers:
        oneDriver = json.loads(driver);
        try:            
            conn.execute("INSERT INTO driver (label, profile) VALUES('" + oneDriver["label"] + "'," + str(profile_id) + ")");
        except Exception:
            return "Error adding a driver"
        else:
            conn.commit();   

