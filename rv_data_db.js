// c.query('SELECT * FROM users WHERE id = ? AND name = ?',
//         [ 1337, 'Frylock' ],
//         function(err, rows) {
//   if (err)
//     throw err;
//   console.dir(rows);
// });

var _client;

var STATE_SUCCESSFULLY_INSERT_DATA = "STATE_SUCCESSFULLY_INSERT_DATA";
var STATE_SUCCESSFULLY_UPDATE_DATA = "STATE_SUCCESSFULLY_UPDATE_DATA";
var STATE_FAILURE_INSERT_DATA = "STATE_FAILURE_INSERT_DATA";


function RVDataDB(client) {
  _client = client;
}

RVDataDB.prototype.changeSingleData = (user_id, data, callback) => {

  // データ更新日が古ければ上書き
  var changeQuery = 'UPDATE returnvisitor_db.rv_data SET class_name = "?" , updated_at = "?", json_data = "?" WHERE data_id = "?" AND user_id = "?" AND updated_at < "?";';
  console.log(changeQuery);
  _client.query(changeQuery, [data.class_name, data.updated_at, data.data, data.id, user_id, data.updated_at], (err, rows) => {

    // console.dir(rows);
    // console.dir(err);

    if (rows) {
      if (rows.info.affectedRows == 1) {
        var result = {
          state: STATE_SUCCESSFULLY_UPDATE_DATA
        };
        console.log('result.state: ' + result.state);
        callback(result);
      } else {
        RVDataDB.prototype.insertSingleData(user_id, data, callback);
      }
    }
  });
  _client.end();
}

RVDataDB.prototype.insertSingleData = (user_id, data, callback) => {

  // console.log('insertSingleData called.');

  var insertQuery = 'INSERT INTO returnvisitor_db.rv_data (user_id, data_id, class_name, updated_at, json_data) VALUES ("?", "?", "?", "?", "?" );';
  // console.log( 'insertQuery: ' + insertQuery);
  _client.query(insertQuery, [user_id, data.id, data.class_name, data.updated_at, data.data], (err, rows) => {
    if (rows) {
      if (rows.info.affectedRows == 1) {
        var result = {
          state: STATE_SUCCESSFULLY_INSERT_DATA
        };
        // console.log('result.state: ' + result.state);
        callback(result);
      }
    }
  });
  _client.end();
};

RVDataDB.prototype.saveSingleData = (user_id, data, callback) => {

  console.log('saveSingleData called.');

  RVDataDB.prototype.changeSingleData(user_id, data, callback);

}

RVDataDB.prototype.saveDataArray = (user_id, array, callback) => {
  // callback(result)
  console.log('saveDataArray called.');
  console.dir(array);

  for ( var i = 0 ; i < array.length ; i++ ) {
    RVDataDB.prototype.saveSingleData(user_id, array[i], (result) => {});
  }

  for ( var i = 0 ; i < array.length ; i++ ) {
    if (array[i].class_name === 'DeletedData') {
      var deletedData = array[i];
      var dataString = deletedData.data;
      console.log('dataString: ' + dataString);
      dataString = dataString.replace(/\*double_quotes\*/g, '"');
      console.log('dataString (replaced): ' + dataString);
      var parsedData = JSON.parse(dataString);

      RVDataDB.prototype.deleteSingleData(user_id, parsedData.data_id, () => {})
    }
  }

  var result = {}
  // console.dir(result);
  callback(result);

}

RVDataDB.prototype.deleteSingleData = (user_id, data_id, callback) => {
  var deleteDataQuery = 'DELETE FROM returnvisitor_db.rv_data WHERE user_id = "?" AND data_id = "?";';
  console.log('deleteDataQuery: ' + deleteDataQuery);
  _client.query(deleteDataQuery, [user_id, data_id], (err, rows) =>{
    console.log('err:');
    console.dir(err);
    console.log('rows:');
    console.dir(rows);
    if (rows) {
      if (rows.info.affectedRows >= 1) {

      }
    } else {h

    }
  });
  _client.end();
}

RVDataDB.prototype.loadDataLaterThanTime = (user_id, time, callback) => {
  // callback(loaded_rows)
  console.log('loadDataLaterThanTime called.');
  var laterDataQuery = 'SELECT * FROM returnvisitor_db.rv_data WHERE user_id = "?" AND updated_at > "?";'
  console.log('laterDataQuery: ' + laterDataQuery);

  _client.query(laterDataQuery, [user_id, time], (err, rows) => {

    var loaded_rows = [];
    for (var i = 0 ; i < rows.length ; i++ ) {
      var row = rows[i];
      var data = {};
      data.id       = row.data_id;
      data.user_id = row.user_id;
      data.data = row.json_data;
      data.updated_at = row.updated_at;
      data.class_name = row.class_name;
      loaded_rows.push(data);
    }

    callback(loaded_rows);
  });
  _client.end();

}


module.exports = RVDataDB;
