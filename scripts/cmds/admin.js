
const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "1.7",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      en: "Add, remove, edit admin role"
    },
    category: "box chat",
    guide: {
      en: "{pn} add <uid | @tag>\n{pn} remove <uid | @tag>\n{pn} list"
    }
  },

  onStart: async function ({ message, args, event }) {
    const ownerUID = String(config.godUID || "");
    const ownerName = config.ownerName || "Edward";

    // Only the configured owner can manage bot admins.
    if (String(event.senderID) !== ownerUID) {
      return message.reply(
        `❌ Only ${ownerName} can manage bot admin access.`
      );
    }

    if (!Array.isArray(config.adminBot)) {
      config.adminBot = [];
    }

    const admins = config.adminBot.map(String);
    const action = (args[0] || "").toLowerCase();

    const saveAdmins = () => {
      config.adminBot = [...new Set(admins.map(String))];

      writeFileSync(
        global.client.dirConfig,
        JSON.stringify(config, null, 2),
        "utf8"
      );
    };

    switch (action) {
      case "add":
      case "-a": {
        const uid = args[1] ||
          (event.mentions &&
           Object.keys(event.mentions)[0]);

        if (!uid) {
          return message.reply("⚠️ Provide a UID or tag a user.");
        }

        const id = String(uid).replace(/[^\d]/g, "");

        if (!id) {
          return message.reply("⚠️ Invalid UID.");
        }

        if (admins.includes(id)) {
          return message.reply(`⚠️ ${id} is already a bot admin.`);
        }

        admins.push(id);
        saveAdmins();

        return message.reply(`✅ Added bot admin: ${id}`);
      }

      case "remove":
      case "-r": {
        const uid = args[1] ||
          (event.mentions &&
           Object.keys(event.mentions)[0]);

        if (!uid) {
          return message.reply("⚠️ Provide a UID or tag a user.");
        }

        const id = String(uid).replace(/[^\d]/g, "");

        if (!id) {
          return message.reply("⚠️ Invalid UID.");
        }

        if (id === ownerUID) {
          return message.reply("❌ The bot owner cannot be removed.");
        }

        if (!admins.includes(id)) {
          return message.reply(`⚠️ ${id} is not a bot admin.`);
        }

        config.adminBot = admins.filter(x => x !== id);
        saveAdmins();

        return message.reply(`✅ Removed bot admin: ${id}`);
      }

      case "list":
      case "-l": {
        const list = [...new Set([ownerUID, ...admins])]
          .filter(Boolean);

        return message.reply(
          "👑 BOT ADMIN LIST\n\n" +
          list.map((id, i) => `${i + 1}. ${id}`).join("\n")
        );
      }

      default:
        return message.reply(
          "Usage:\n/admin add <uid>\n/admin remove <uid>\n/admin list"
        );
    }
  }
};
