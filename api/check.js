export default function handler(req, res) {
  const { userId } = req.query;
  const whitelist = ['123456789', '987654321'];
  if (whitelist.includes(userId)) {
    res.status(200).send('OK');
  } else {
    res.status(200).send('NO');
  }
}
