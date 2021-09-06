const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://phonebook:${password}@cluster0.d4bro.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url);

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', phoneBookSchema);

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({ name: name, number: number });

  person.save().then(result => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}

if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person.name, person.number);
    });

    mongoose.connection.close();
  });
}
