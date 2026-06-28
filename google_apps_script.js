// Google Apps Script for MentorAI Sheets & Drive Storage Backend
// Deploy as a Web App (Execute as "Me", Who has access: "Anyone")

// Folder ID for Google Drive Sync (Replace with your actual folder ID)
var DRIVE_FOLDER_ID = "1GtIokc7MwbH4lH3aCpnhYUn1mQMj-l2_"; 

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure tabs exist
    getOrCreateSheet(ss, "users");
    getOrCreateSheet(ss, "roadmaps");
    
    if (action === "register") {
      return handleRegister(ss, requestData);
    } else if (action === "login") {
      return handleLogin(ss, requestData);
    } else if (action === "get_roadmap") {
      return handleGetRoadmap(ss, requestData);
    } else if (action === "save_roadmap") {
      return handleSaveRoadmap(ss, requestData);
    } else if (action === "upload_file") {
      return handleUploadFile(requestData);
    } else {
      return jsonResponse({status: "error", message: "Invalid action"});
    }
  } catch (err) {
    return jsonResponse({status: "error", message: err.toString()});
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "users") {
      sheet.appendRow(["username", "password_hash", "email", "created_at"]);
    } else if (name === "roadmaps") {
      sheet.appendRow(["username", "topic", "data", "updated_at"]);
    }
  }
  return sheet;
}

function handleRegister(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rows = sheet.getDataRange().getValues();
  
  // Check if username already exists
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      return jsonResponse({status: "error", message: "Username already exists"});
    }
  }
  
  sheet.appendRow([data.username, data.password_hash, data.email, new Date().toISOString()]);
  return jsonResponse({status: "success"});
}

function handleLogin(ss, data) {
  var sheet = ss.getSheetByName("users");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      return jsonResponse({status: "success", password_hash: rows[i][1]});
    }
  }
  return jsonResponse({status: "error", message: "User not found"});
}

function handleGetRoadmap(ss, data) {
  var sheet = ss.getSheetByName("roadmaps");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username && rows[i][1] === data.topic) {
      try {
        var parsedData = JSON.parse(rows[i][2]);
        return jsonResponse({status: "success", roadmap_data: parsedData});
      } catch (e) {
        return jsonResponse({status: "success", roadmap_data: rows[i][2]});
      }
    }
  }
  return jsonResponse({status: "success", roadmap_data: null});
}

function handleSaveRoadmap(ss, data) {
  var sheet = ss.getSheetByName("roadmaps");
  var range = sheet.getDataRange();
  var rows = range.getValues();
  var serializedData = typeof data.roadmap_data === "string" ? data.roadmap_data : JSON.stringify(data.roadmap_data);
  
  // Look for existing row to update
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username && rows[i][1] === data.topic) {
      sheet.getRange(i + 1, 3).setValue(serializedData);
      sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
      return jsonResponse({status: "success"});
    }
  }
  
  // If not found, append a new row
  sheet.appendRow([data.username, data.topic, serializedData, new Date().toISOString()]);
  return jsonResponse({status: "success"});
}

function handleUploadFile(data) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var blob = Utilities.newBlob(Utilities.base64Decode(data.file_content_base64), data.mime_type, data.filename);
    var file = folder.createFile(blob);
    
    // Set view permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return jsonResponse({status: "success", url: file.getUrl()});
  } catch (err) {
    return jsonResponse({status: "error", message: err.toString()});
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("MentorAI Apps Script Proxy active.");
}
