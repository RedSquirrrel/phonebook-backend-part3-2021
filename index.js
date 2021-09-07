const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

const morgan = require('morgan');
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', request => JSON.stringify(request.body));

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

// let persons = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456',
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendieck',
//     number: '39-23-6423122',
//   },
// ];

app.get('/info', (request, response) => {
  response.send(`<h2>Phonebook has info for ${persons.length} people</h2><p>${new Date()}</p>`);
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing',
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number is missing',
    });
  }

  // for (let i = 0; i < persons.length; i++) {
  //   if (persons[i].name === body.name) {
  //     return response.status(400).json({
  //       error: 'name must be unique',
  //     });
  //   }
  // }

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
