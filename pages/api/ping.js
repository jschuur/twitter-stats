export default function handler(req, res) {
  console.log(req.path);
  res.json({
    message: 'Pong',
  })
}