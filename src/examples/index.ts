import { BlipClient } from "../clients/BlipClient.js";
import { jsonLog } from "../utils/jsonLog.js";
interface TagsDocument {
	tags: { text: string }[];
	hasTags: boolean;
	isTagsRequired: boolean;
}
const closerTags = [
	"Antecipação - Antecipação realizada - data do pagamento (quando a pessoa recebe o salário)",
	"Antecipação - Deseja suporte",
	"Antecipação - Deseja trancar a graduação",
	"Antecipação - Deseja trocar a graduação",
	"Antecipação - Já se programou para a data padrão",
	"Antecipação - Não sabia da matrícula",
	"Antecipação - Oportunidade não chamou atenção",
	"Antecipação - Pagou antes do primeiro contato da célula",
	"Antecipação - Problema com suporte",
	"Antecipação - Sem condições financeiras",
	"Antecipação - Trancou a graduação (cenários que o aluno já está cancelado)",
];

const gradTags = [
	"Achou que era gratuito",
	"Aguardando retorno",
	"Antecipação - Antecipação realizada - CRM Bônus",
	"Com intenção - Esta pesquisando",
	"Com intenção - Ficou de Pensar",
	"Com intenção - Motivos Acadêmicos",
	"Com intenção - Motivos Financeiros",
	"Com intenção - Motivos Pessoais",
	"Com intenção - Proximo Semestre",
	"Concorrência",
	"CopilotoInatividade",
	"FUNDESC - Duvidas",
	"FUNDESC - Já é aluno",
	"FUNDESC - Matricula não realizada",
	"FUNDESC - Matricula realizada",
	"Já é aluno",
	"Matricula Realizada por polo",
	"Matrícula Realizada",
	"Não concluiu o ensino médio",
	"Não ofertamos o curso desejado",
	"PROUNI - Dúvidas",
	"PROUNI - Matricula realizada",
	"Reabertura solicitada",
	"Sem intenção - Motivos Acadêmicos",
	"Sem intenção - Motivos Financeiros",
	"Sem intenção - Motivos Pessoais",
	"Sem resposta",
	"Vai até o polo",
];

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "ZGV2c2tlcHNyb3V0ZXI6WnUxUmFBZEZFRDJNT1Nqellld0c=",
	// apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

// const res = await client.buckets.findDocument<string>("blip:desk:tags");
// const queues = await client.queues.findAll();

// const tags = JSON.parse(res) as TagsDocument

// const tagsString = tags.tags.map(t => t.text)

// const tags = Array.from({ length: 5 }).map((_, i) => `Tag add ${i}`);


const attendants = await client.flows.findById("2416097588897135");
// const queues = await client.queues.findAll()

// console.log(queues);


// await Promise.all(
// 	attendants.map((attendant) =>
// 		client.attendants.createOrUpdate({
// 			...attendant,
// 			teams: queues.map(q => q.name)
// 		}),
// 	),
// );
console.log(attendants);

// const res = await client.queues.setQueueAttendanceRules({
// 	id: "e23b17da-eb43-4b9a-a394-6dbe4bdc93bb",
// 	title: "teste rule",
// 	team: "tags queue",
// 	relation: "Contains",
// 	isActive: true,
// 	conditions: [
// 		{
// 			property: "Contact.Email",
// 			relation: "Contains",
// 			values: ["teste"]
// 			// extrasProperty: "tttttaa",
// 		},
// 		{
// 			property: "Contact.Email",
// 			relation: "Contains",
// 			values: ["teste"]
// 			// extrasProperty: "tttttaa",
// 		},
// 	],
// 	operator: "And",
// 	priority: 2,
// 	queueId: "058cb97e-1bf1-48cb-a3ba-019eccbd9965",
// });
// console.log(res);


// await client.queues.setQueueTags(res.id, gradTags)
// await Promise.all(
// 	queues.map((queue) =>
// 		client.queues.setQueueTags(
// 			queue.id,
// 			Array.from({ length: 2 }).map((_, i) => `${queue.name} - tag ${i}`),
// 		),
// 	),
// );
