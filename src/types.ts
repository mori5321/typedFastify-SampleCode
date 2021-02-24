import * as Fastify from 'fastify';
import { FastifyRequest } from 'fastify';
import { Static } from '@sinclair/typebox';

type CustomRequest<
  Params,
  Query,
  ReqBody,
  Headers extends Fastify.RequestHeadersDefault
> = Omit<FastifyRequest, "params" | "query" | "body" | "headers">
& { params: Params, body: ReqBody, query: Query, headers: Headers }

// NOTE: 妥協
//
// TypeScriptにXOR(排他的論理和)やExactTypeが実装されたらもう少しカッチリした型にできると思う。
// あるいはConditionalTypeでがんばればいける...>
//
// # 理想系
// code = 200の場合 -> body = { user: { id: number, name: string } }
// code = 404の場合 -> body = { message: string }
// といった具合に、statusCodeとbodyの組み合わせを型で制限したい。
// 
// # 現状
// codeは 200 | 404 
// bodyは { user: { id: number, name: string}} | { message: string } 
//
// つまり、code = 200, body = { message: string }
// のような型が許容されてしまっている。
type CustomResponse<StatusCode, ResponseSchema> = {
  code: StatusCode,
  body: Static<ResponseSchema>
}

type Handler<
  Request extends FastifyRequest,
  ResponseBody
> = (request: Request, reply: Fastify.FastifyReply) => Promise<ResponseBody>


export { Handler, CustomRequest, CustomResponse }

