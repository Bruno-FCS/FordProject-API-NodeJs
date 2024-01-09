module.exports = function formatVin(vin) {
  return JSON.stringify(vin).toUpperCase().replaceAll('"', "");
};
