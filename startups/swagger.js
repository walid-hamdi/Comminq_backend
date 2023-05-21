import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  swaggerDefinition: {
    openapi: "3.0.3",
    info: {
      title: "Comminq API Documentation",
      version: "1.0.0",
      description:
        "This is the API documentation for Comminq. It provides details about the available endpoints, request/response structures.",
      contact: {
        name: "Walid Hamdi",
        email: "walidhamdiddev@gmail.com",
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
            picture: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
          required: ["name", "email", "password"],
        },
      },
    },
    servers: [
      {
        url: "http://localhost:4000", // Development server
        description: "Development server",
      },
      {
        url: "https://comminq-backend.onrender.com/", // Production server URL
        description: "Production server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the files containing your route definitions
};

const specs = swaggerJsdoc(options);

export default {
  serve: swaggerUi.serve,
  specsSetup: swaggerUi.setup(specs),
};
