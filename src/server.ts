import app from "./app";

const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send('MediStore API is running perfectly!');
});
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});