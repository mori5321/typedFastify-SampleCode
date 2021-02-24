import * as Fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Type, Static } from '@sinclair/typebox';
import { Handler, CustomRequest, CustomResponse } from './types';

const server: Fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = Fastify.fastify({ logger: true })


server.addHook(
  "preSerialization",
  async(
    _req,
    rep,
    payload: { code: number, body: any }
  ) => {
  rep.code(payload.code)
  return payload.body
})

const paramsSchema = Type.Object({
  id: Type.Number()
})

const responseSchema = {
  200: Type.Object({
    user: Type.Object({
      id: Type.Number(),
      name: Type.String(),
    })
  }),
  404: Type.Object({
    message: Type.String()
  })
}

const schema: Fastify.RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    response: responseSchema,
  }
}

type Params = Static<typeof paramsSchema>;
type Request = CustomRequest<Params, {}, {}, {}>;
type StatusCode = keyof typeof responseSchema;
type ResponseBody = CustomResponse<StatusCode, typeof responseSchema[StatusCode]>;

const handler: Handler<Request, ResponseBody> = async (request, _response) => {
  if (request.params.id % 2 === 0) {
    return {
      code: 200,
      body: {
          user: {
            id: 1,
            name: "Tom" 
          }  
      }
    }
  } else {
    return {
      code: 404,
      body: {
        message: "Not Found"
      }
    }
  }
}


server.get("/users/:id", schema, handler)

const start = async () => {
  try {
    const port = 9000;
    await server.listen(port, '0.0.0.0');
    server.log.info(`Listening: ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
