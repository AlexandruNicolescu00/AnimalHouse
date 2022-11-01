const notFound = (req, res) => res.status(404).send("Route non esistente");

module.exports = notFound;
