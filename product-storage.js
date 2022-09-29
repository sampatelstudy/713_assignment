var plugin = function (options) {
  var seneca = this;

  seneca.add({ role: "product", cmd: "add" }, function (message, respond) {
    this.make("product").data$(message.data).save$(respond);
  });

  seneca.add({ role: "product", cmd: "get-all" }, function (message, respond) {
    this.make("product").list$({}, respond);
  });

  seneca.add({ role: "product", cmd: "delete" }, function (message, respond) {
    this.make("product").remove$(message.id, respond);
  });
};

module.exports = plugin;
