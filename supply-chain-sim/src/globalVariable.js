import {
  Node,
  Graph,
  Agent,
  Event,
  Activity,
  Gateway,
  Transportation,
} from "./constants/class";
import { AgentType, RunState, EventType, EventStartType } from "./constants";
import { runShipment } from "./constants/callback";

export const supplier = new Agent(
  "supplier",
  -98,
  37,
  [
    {
      name: "apple",
      quantity: 50,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 50,
      price: 60,
      cost: 20,
    },
  ],
  null,
  AgentType.Supplier,
  "id_01"
);

export const distributor = new Agent(
  "distributor",
  -93,
  36,
  [
    {
      name: "apple",
      quantity: 30,
      price: 10,
      cost: 5,
    },
  ],
  null,
  AgentType.distributor,
  "dis_01"
);

export const customer2 = new Agent(
  "customer2",
  -96,
  38,
  [],
  null,
  AgentType.Supplier,
  "id_03"
);

supplier.demand = [
  {
    name: "apple",
    quantity: 10,
  },
  {
    name: "pearl",
    quantity: 20,
  },
];

/* customer1.demand = [
  {
    name: "apple",
    quantity: 10,
  },
  {
    name: "pearl",
    quantity: 20,
  },
]; */

customer2.demand = [
  {
    name: "apple",
    quantity: 10,
  },
  {
    name: "pearl",
    quantity: 20,
  },
];

distributor.demand = [
  {
    name: "apple",
    quantity: 10,
  },
  {
    name: "pearl",
    quantity: 20,
  },
];

/* export const t1 = new Transportation("Truck", supplier, customer2, 300, []); */
export const t1 = new Transportation("Truck", supplier, distributor, 300, []);

customer2.inventory.push({
  name: "apple",
  quantity: 45,
  price: 50,
  cost: 40,
});

supplier.customerDemand = [
  {
    target: customer2,
    demand: customer2.demand,
    transport: t1,
  },
];

customer2.customerDemand = [
  {
    target: supplier,
    demand: supplier.demand,
    transport: t1,
  },
];

///supplier
supplier.transport.push(t1);
customer2.transport.push(t1);

const start1 = new Event(
  "receive order",
  null,
  1,
  EventType.Start,
  EventStartType.Message,
  2,
  [supplier.print.bind(supplier)],
  "star1"
);
const act1 = new Activity(
  "load",
  null,
  0,
  [
    supplier.print.bind(supplier),
    supplier.checkDemand.bind(supplier),
    supplier.load.bind(supplier),
    /* supplier.unload.bind(supplier), */
  ],
  "act1"
);
const act2 = new Activity(
  "ship",
  null,
  0,
  [supplier.move.bind(supplier)],
  "act2"
);
const end1 = new Event(
  "close order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2,
  [supplier.print.bind(supplier)],
  "end1"
);
start1.next = act1;
act1.next = act2;
act2.next = end1;
supplier.startEvent = start1;
supplier.taskList = [start1, act1, act2, end1];
/////
const start3 = new Event(
  "Open",
  null,
  1,
  EventType.Start,
  EventStartType.Timer,
  4,
  [distributor.printWhole.bind(distributor)],
  "start3"
);
const act9 = new Activity(
  "load",
  null,
  3,
  distributor.print.bind(distributor),
  "load"
);
const end4 = new Event(
  "Close",
  null,
  1,
  EventType.End,
  EventStartType.Auto,
  0,
  [],
  "cose"
);
start3.next = act9;
act9.next = end4;
distributor.startEvent = start3;
distributor.taskList = [start3, act9, end4];

////customer1
const start2 = new Event(
  "Open Store",
  null,
  1,
  EventType.Start,
  EventStartType.Timer,
  8,
  [customer2.print.bind(customer2), customer2.printWhole],
  "start2"
);
const act3 = new Activity(
  "Place oder",
  null,
  1,
  [customer2.print.bind(customer2)],
  "act3"
);
/* const instant1 = new Event(
  "Receive shipment",
  null,
  1,
  EventType.Intermediate,
  EventStartType.Message,
  2,
  [customer2.printWhole.bind(customer2)],
  "inst1"
);
const act4 = new Activity(
  "Unload",
  null,
  4,
  [customer1.print.bind(customer2)],
  "act4"
); */
const end2 = new Event(
  "close Order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2,
  [customer2.print.bind(customer2)],
  "close2"
);
start2.next = act3;
act3.next = end2;
/* act3.next = instant1;
act3.throw = supplier;
act3.throwEvent = start1;
act2.throw = customer2;
act2.throwEvent = instant1;
instant1.next = act4;
act4.next = end2; */
customer2.startEvent = start2;
customer2.taskList = [start2, act3, end2];
/////

export var vertices = [supplier, distributor];
export var CurrentGraph = new Graph();
// adding vertices
for (var i = 0; i < vertices.length; i++) {
  CurrentGraph.addVertex(new Node(i, vertices[i]));
}

CurrentGraph.addEdge(0, 1);

export const curData = {
  currentAgent: null,
  currentTask: null,
};

export var Map = {
  current: null,
};
