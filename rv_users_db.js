var STATUS_201_CREATED              = "STATUS_201_CREATED";
var STATUS_202_AUTHENTICATED        = 'STATUS_202_AUTHENTICATED';
var STATUS_400_DUPLICATE_USER_NAME  = 'STATUS_400_DUPLICATE_USER_NAME';
var STATUS_400_SHORT_USER_NAME      = "STATUS_400_SHORT_USER_NAME";
var STATUS_400_SHORT_PASSWORD       = "STATUS_400_SHORT_PASSWORD";
var STATUS_401_UNAUTHORIZED         = "STATUS_401_UNAUTHORIZED";
var STATUS_404_NOT_FOUND            = 'STATUS_404_NOT_FOUND';

var _client;

function RVUsersDB(client) {
  _client = client;
}

RVUsersDB.prototype.login = (user_name, password, callback) => {
  // ログインの流れ
  // ユーザ名とパスワードでDBクエリ
  // if データ件数が1件ヒット
  //       202 AUTHENTICATED ユーザデータを返す。
  // else
  //   ユーザ名だけでDBクエリ
  //    if データ件数が1件ヒット
  //        40１　UNAUTHORIZED ユーザ名だけを返す。
  //    else
  //        404 NOT_FOUND ユーザ名だけを返す。

//   c.query('SELECT * FROM users WHERE id = ? AND name = ?',
//         [ 1337, 'Frylock' ],
//         function(err, rows) {
//   if (err)
//     throw err;
//   console.dir(rows);
// });

  console.log('users.login called!');
  var queryUser = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "?" AND password = "?" ;';
  console.log(queryUser);
  _client.query(queryUser, [username, password], function(err, rows){
    if (rows) {
      if (rows.info.numRows == 1) {
        // データが1件だけの時のみデータを返す。
        let result = {
          user: rows[0],
          status_code: STATUS_202_AUTHENTICATED
        };
        console.log(STATUS_202_AUTHENTICATED);
        callback(result);
      } else {
        // 1件以外の時
        RVUsersDB.prototype.existsUser(user_name, function(exists){
          if (exists) {
            let result = {
              user:{
                user_name: user_name
              },
              status_code: STATUS_401_UNAUTHORIZED
            }
            console.log(STATUS_401_UNAUTHORIZED);
            callback(result);
          } else {
            let result = {
              user:{
                user_name: user_name
              },
              status_code: STATUS_404_NOT_FOUND
            }
            console.log(STATUS_404_NOT_FOUND);
            callback(result);
          }
        });
      }
    } else {
      // rowがnullになるケースがあるかどうかは分からないけれど。
      let result = {
        user:{
          user_name: user_name
        },
        status_code: STATUS_404_NOT_FOUND
      }
      console.log(STATUS_404_NOT_FOUND);
      callback(result);
    }

  });
  _client.end();
}

RVUsersDB.prototype.createUser = (user_name, password, callback) => {

  // callback(result {user{user_name, password}, status_code})
  // アカウント新規作成の流れ
  //    if ユーザ名が存在するか
  //      400 BAD REAUEST DUPLICATE USER
  //    else
  //      if ユーザ名は8文字以下か
  //        400 BAD REQUEST SHORT user_name
  //      else
  //        if パスワードは8文字以下か
  //          400 BAD REQUEST SHORT PASSWORD
  //        else
  //          新規作成　201 CREATED
  RVUsersDB.prototype.existsUser(user_name, function(exists) {

      if (exists) {

        let result = {
          user:{
            user_name: user_name
          },
          status_code: STATUS_400_DUPLICATE_USER_NAME
        };

        console.log(STATUS_400_DUPLICATE_USER_NAME);
        callback(result);
      } else {
        // ユーザ名が8文字以下か
        if (user_name.length < 8) {

          let result = {
            user:{
              user_name: user_name
            },
            status_code: STATUS_400_SHORT_USER_NAME
          };

          console.log(STATUS_400_SHORT_USER_NAME);
          callback(result);
        } else {
          // パスワードが8文字以下か
          if (password.length < 8) {

            let result = {
              user:{
                user_name: user_name
              },
              status_code: STATUS_400_SHORT_PASSWORD
            };

            console.log(STATUS_400_SHORT_PASSWORD);
            callback(result);
          } else {

            // generate user_id
            var dateString = new Date().getTime().toString();
            var user_id = 'user_id_' + user_name + '_' + dateString;
            console.log('user_id: ' + user_id);

            // 新規作成クエリ
            var createUserQuery = 'INSERT INTO returnvisitor_db.users (user_name, password, user_id, updated_at) VALUES ("?", "?", "?","?" );';
            console.log(createUserQuery);
            let dateTime = new Date().getTime().toString();
            _client.query(createUserQuery, [user_name, password, user_id, dateTime], (err, rows) => {
              console.dir(err);
              if (rows) {
                if (rows.info.affectedRows == 1) {
                  RVUsersDB.prototype.login(user_name, password, (result) => {
                    result.status_code = STATUS_201_CREATED;
                    console.log(STATUS_201_CREATED);
                    callback(result);
                  });
                }
              }
            });
            _client.end();
          }
        }
      }
  });

}

RVUsersDB.prototype.existsUser = (user_name, callback) => {

  // callback(boolean)

  console.log('existsUser called!');
  var queryUserName = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "?";';
  console.log(queryUserName);
  _client.query(queryUserName, [user_name], (err, rows) => {
    if (rows) {
      if (rows.info.numRows >= 1) {
        console.log(user_name + ': Exists.');
        callback(true);
      } else {
        console.log(user_name + ': Does not Exist.');
        callback(false);
      }
    } else {
      console.log(user_name + ': Does not Exist.');
      callback(false);
    }
  });
  _client.end();
}

module.exports = RVUsersDB;
