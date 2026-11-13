module.exports = {
  config: {
    name: "addfriend",
    version: "1.0",
    author: "Cheken",
    countDown: 5,
    role: 0, // <-- 0 = ANYONE can use! Even not admin!
    shortDescription: "confirm friend request",
    longDescription: "confirm/add friend even if not admin",
    category: "utility",
    guide: "{pn} | {pn} list | {pn} accept [uid] | {pn} accept all"
  },

  onStart: async function ({ args, message, event, api }) {
    const action = args[0]?.toLowerCase();

    // LIST all friend requests
    if (!action || action === "list") {
      try {
        const requests = await new Promise((resolve, reject) => {
          api.getFriendRequests((err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        });

        if (!requests || requests.length == 0) {
          return message.reply("No friend requests! 👑");
        }

        let msg = `📬 Friend Requests: ${requests.length}\n\n`;
        requests.slice(0, 20).forEach((r, i) => {
          msg += `${i+1}. ${r.name} - ${r.userID}\n`;
        });
        msg += `\nUse: -addfriend accept [uid]\nOr: -addfriend accept all`;
        return message.reply(msg);
      } catch (e) {
        return message.reply(`Error: ${e.message}`);
      }
    }

    // ACCEPT
    if (action === "accept" || action === "confirm" || action === "approve") {
      const target = args[1]?.toLowerCase();

      // accept all
      if (target === "all") {
        try {
          const requests = await new Promise((resolve, reject) => {
            api.getFriendRequests((err, data) => {
              if (err) return reject(err);
              resolve(data);
            });
          });

          if (!requests || requests.length == 0) {
            return message.reply("No requests to accept!");
          }

          let count = 0;
          for (const req of requests) {
            try {
              await new Promise((res, rej) => {
                api.handleFriendRequest(req.userID, true, (err) => {
                  if (err) return rej(err);
                  res();
                });
              });
              count++;
              await new Promise(r => setTimeout(r, 1000)); // delay 1 sec to avoid block
            } catch {}
          }

          return message.reply(`✅ Accepted ${count}/${requests.length} friend requests! 👑`);
        } catch (e) {
          return message.reply(`Error: ${e.message}`);
        }
      }

      // accept specific uid
      const uid = args[1];
      if (!uid) return message.reply("Give UID! Example: -addfriend accept 1000xxxx");

      try {
        await new Promise((resolve, reject) => {
          api.handleFriendRequest(uid, true, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        return message.reply(`✅ Accepted friend request: ${uid} 👑`);
      } catch (e) {
        return message.reply(`❌ Failed: ${e.message}\nMake sure UID is correct and has pending request!`);
      }
    }

    return message.reply("Use: -addfriend list / -addfriend accept [uid] / -addfriend accept all");
  }
};
