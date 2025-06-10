import sql from "../models/db.js"
import * as trackNotifier from "../track_notifier.js"

export const append = async (req, res) => {
  // Validate request
  if (!req.body || !req.body.log_id) {
    return res.status(400).send({
      message: "log_id must be provided"
    });
  }

  const logId = req.body.log_id
  
  sql.query(`SELECT users.tg_chat_id, users.delay, logs.ip_addr, logs.ip_loc, logs.browser, logs.*, posts.permalink FROM users inner join posts on users.id = posts.author inner join logs on logs.post_id = posts.id where logs.id = ${logId}`, (err, dbres) => {
    if (err) {
      console.log("error: ", err);
      return res.status(400).send({
        message: err
      });
    }

    if (!dbres.length) {
      const msg = `could not find info related to log_id(${logId})`
      console.log(msg);
      return res.status(400).send({
        message: msg
      });
    }

    const result = dbres[0]

    const chatid = result.tg_chat_id
    const delay = Number(result.delay)

    if (!chatid) {
      const msg = 'invalid tg_chat_id'
      console.log(msg);
      return res.status(400).send({
        message: msg
      });
    }

    if (!delay) {
      delay = 1
    }
    
    /*

    */

    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    let date = new Date()
    const formattedDate = date.toLocaleString('en-US', options);

    result.date = formattedDate
    
    trackNotifier.append({ chatid, delay, result })

    return res.send({message: 'success'})

  });
};
