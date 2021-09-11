const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

const morgan = require('morgan');
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', request => JSON.stringify(request.body));

app.get('/info', (request, response) => {
  Person.find({}).then(person => {
    response.send(`<h2>Phonebook has info for ${person.length} people</h2><p>${new Date()}</p>`);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name is missing' });
  } else if (body.number === undefined) {
    return response.status(400).json({ error: 'number is missing' });
  }

  Person.find({ name: body.name }, (error, existingPerson) => {
    if (existingPerson.length) {
      return response.status(400).json({
        error: 'name must be unique',
      });
    } else {
      person
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormatedPerson => {
          response.json(savedAndFormatedPerson);
        })
        .catch(error => next(error));
    }
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
