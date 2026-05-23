import OpenAI from "openai"

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
})

export async function POST(
  req: Request
) {
  try {
    const {
      messages,
      image,
    } = await req.json()

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: messages.map(
          (
            msg: any,
            index: number
          ) => ({
            role: msg.role,

            content:
              image &&
              index ===
                messages.length -
                  1
                ? [
                    {
                      type:
                        "text",

                      text:
                        msg.content,
                    },

                    {
                      type:
                        "image_url",

                      image_url:
                        {
                          url: image,
                        },
                    },
                  ]
                : msg.content,
          })
        ),

        stream: true,
      })

    const encoder =
      new TextEncoder()

    const stream =
      new ReadableStream({
        async start(
          controller
        ) {
          for await (
            const chunk of response
          ) {
            const text =
              chunk.choices[0]
                ?.delta
                ?.content || ""

            controller.enqueue(
              encoder.encode(
                text
              )
            )
          }

          controller.close()
        },
      })

    return new Response(stream)
  } catch (error: any) {
    console.log(error)

    return Response.json({
      error:
        "Something went wrong",
    })
  }
}