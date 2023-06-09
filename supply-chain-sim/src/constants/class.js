import { RUN_STATE } from ".";
import { CURRENT_GRAPH } from "../globalVariable";
import { runShipment } from "./callback";
import _ from "lodash";

class Node {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.adjacent = [];
    this.parent = [];
  }
}
class Graph {
  // defining vertex array and
  // adjacent list
  constructor() {
    this.AdjList = [];
  }
  addVertex(v) {
    // initialize the adjacent list with a
    // null array
    this.AdjList.push(v);
  }
  addEdge(v, w) {
    // get the list for vertex v and put the
    // vertex w denoting edge between v and w
    const temp1 = this.AdjList.find((e) => e.id === v);
    const temp2 = this.AdjList.find((e) => e.id === w);
    temp1.adjacent.push(temp2);
    temp2.parent.push(temp1);
  }
  duplicateNode(id) {
    //Duplicate the adjList and the parent
    for (let i = 0; i < this.AdjList.length; i++) {
      if (this.AdjList[i].id == id) {
        const duplicateNode = new Node(
          this.AdjList.length,
          _.cloneDeep(this.AdjList[i].data)
        );
        duplicateNode.parent = this.AdjList[i].parent;
        duplicateNode.adjacent = this.AdjList[i].adjacent;
        duplicateNode.data.name = this.AdjList[i].data.name + duplicateNode.id;
        console.log("Duplicate:", duplicateNode);
        //Add node to adjList of parents
        for (let j = 0; j < duplicateNode.parent.length; j++) {
          duplicateNode.parent[j].adjacent.push(duplicateNode);
        }
        //Clone deep taskList and startEvent
        duplicateNode.data.taskList = _.cloneDeep(
          this.AdjList[i].data.taskList
        );
        duplicateNode.data.startEvent = duplicateNode.data.taskList[0];
        this.addVertex(duplicateNode);
        console.log("Graph after duplicate: ", CURRENT_GRAPH);
        return;
      }
    }
  }
  getLength() {
    return this.AdjList.length;
  }
  printGraph() {
    // get all the vertices
    for (let i = 0; i < this.getLength(); i++) {
      //console.log("Node: ", this.AdjList[i]);
    }
  }
}
class Agent {
  constructor(name, latitude, longitude, inventory, startEvent, type, id) {
    ////console.log("[CONSTRUCTOR CALLED");
    this.name = name;
    this.location = {
      latitude: latitude,
      longitude: longitude,
    };
    this.inventory = [];
    this.startEvent = startEvent;
    this.processes = [];
    this.type = type;
    this.transport = [];
    this.route = null;
    this.runState = RUN_STATE.CAN_RUN;
    this.taskList = [];
    this.id = id;
    this.customerDemand = [];
    this.demand = [];
    this.backOrder = [];
    this.prev = null;
    this.data = {
      totalBackOrder: 0,
      totalInventory: 0,
    };
  }
  /* addBulk(cargo) {
    for (let i = 0; i < cargo.length; i++) {
      this.addInventory(cargo[i]);
    }
  } */
  addInventory(item, quantity) {
    const temp = _.cloneDeep(this.inventory);
    console.log("Before:", temp, " and ", item);
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].name === item.name) {
        temp[i].quantity += quantity;
      }
    }
    this.inventory = temp;
    console.log("After:", this.inventory);
  }
  abstractAddInventory(item) {
    console.log("Add item: ", item);
    for (let i = 0; i < item.length; i++) {
      for (let j = 0; j < this.inventory.length; j++) {
        if (item[i].name == this.inventory[j].name) {
          this.inventory[j].quantity += item[i].quantity;
        }
      }
    }
    console.log("After:", this.inventory);
  }
  abstractRemoveInventory(demand) {
    const returnDeliver = [];
    for (let i = 0; i < demand.length; i++) {
      for (let j = 0; j < this.inventory.length; j++) {
        if (this.inventory[j].name == demand[i].name) {
          if (this.inventory[j].quantity == 0) {
            alert(`stock out for ${this.inventory[j].name}`);
            returnDeliver.push({
              name: demand[i].name,
              quantity: 0,
            });
          } else {
            const temp = this.inventory[j].quantity - demand[i].quantity;
            if (temp < 0) {
              console.log(
                "Not enough in inventory and added to backlog " + this.name
              );
              const itemToAdd = {
                name: demand[i].name,
                quantity: demand[i].quantity,
              };
              this.backOrder.push(itemToAdd);
              returnDeliver.push({
                name: demand[i].name,
                quantity: 0,
              });
            } else {
              //this.inventory[j].quantity = temp;
              returnDeliver.push(demand[i]);
            }
          }
        }
      }
    }
    console.log("After:", this.inventory);
    return returnDeliver;
  }
  removeInventory(item, quantity) {
    console.log(
      "Before:",
      this.inventory,
      " and ",
      item,
      "and quantity: ",
      quantity
    );
    for (let i = 0; i < this.inventory.length; i++) {
      console.log(this.inventory[i].name, item.name);
      if (this.inventory[i].name == item.name) {
        if (this.inventory[i].quantity == 0) {
          alert(`stock out for ${this.inventory[i].name}`);
          return {
            name: item.name,
            quantity: 0,
          };
        }
        const temp = this.inventory[i].quantity - quantity;
        if (temp < 0) {
          console.log(
            "Not enough in inventory and added to backlog " + this.name
          );
          const itemToAdd = {
            name: item.name,
            quantity: this.inventory[i].quantity,
          };
          this.backOrder.push({
            name: item.name,
            quantity: temp * -1,
          });
          this.inventory[i].quantity = 0;
          return itemToAdd;
        } else {
          this.inventory[i].quantity = temp;
          return {
            name: item.name,
            quantity: quantity,
          };
        }
      }
    }
    console.log("After:", this.inventory);
    return true;
  }
  load(obj) {
    for (let i = 0; i < obj.customerDemand.length; i++) {
      console.log(obj.customerDemand);
      obj.customerDemand[i].transport.loadBulk(obj.customerDemand[i].demand);
    }
    obj.calcEverything(obj);
    obj.runState = RUN_STATE.CAN_RUN;
  }
  unload(obj) {
    console.log(obj);
    for (let i = 0; i < obj.transport.length; i++) {
      if (obj.transport[i].cargo.length == 0) {
        console.log("No cargo ?");
        return;
      }
      for (let j = 0; j < obj.transport[i].cargo.length; j++) {
        obj.transport[i].unload(
          obj.transport[i].cargo[j],
          obj.transport[i].cargo[j].quantity
        );
      }
      //clear cargo
      obj.transport[i].cargo.length = 0;
    }
    obj.runState = RUN_STATE.CAN_RUN;
  }
  checkDemand(obj) {
    for (let i = 0; i < obj.customerDemand.length; i++) {
      console.log("[Demand]", obj.customerDemand[i]);
    }
  }
  move(obj) {
    console.log(obj);
    for (let i = 0; i < obj.transport.length; i++) {
      obj.transport[i].move();
    }
    const id = "peep" + obj.name;
    runShipment(obj.route, id, obj, obj.transport[0], [
      () => {
        console.log("Finish shipment");
        obj.unload(obj);
      },
    ]);
    console.log(obj.transport);
  }
  print(obj) {
    //console.log(obj.name);
    obj.runState = RUN_STATE.CAN_RUN;
  }
  printWhole(obj) {
    /* console.log(obj);
    const temp = _.cloneDeep(obj.inventory);
    temp[0].name = "gyaa";
    obj.inventory = temp; */
    /* obj.inventory[0].name = "gyaa"; */
    obj.runState = RUN_STATE.CAN_RUN;
  }
  calcTotalInventory(obj) {
    let res = 0;
    for (let i = 0; i < obj.inventory.length; i++) {
      res += obj.inventory[i].quantity;
    }
    this.data.totalInventory = res;
    console.log("Calc: ", this.data.totalInventory);
  }
  calcBackOrder(obj) {
    if (obj.backOrder.length == 0) {
      console.log("back order empty");
      return;
    }
    let res = 0;
    for (let i = 0; i < obj.backOrder.length; i++) {
      res += obj.backOrder[i].quantity;
    }
    this.data.totalBackOrder = res;
    console.log("Calc: ", this.data.totalBackOrder);
  }
  calcEverything(obj) {
    this.calcTotalInventory(obj);
    this.calcBackOrder(obj);
  }
  onImport(data) {
    this.location = data.location;
    this.inventory = data.inventory;
    this.demand = data.demand;
  }
  getDemand() {
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      if (CURRENT_GRAPH.AdjList[i].data.id == this.id) {
        console.log("Correct: ", CURRENT_GRAPH.AdjList[i]);
        for (let j = 0; j < CURRENT_GRAPH.AdjList[i].adjacent.length; j++) {
          this.customerDemand.push({
            target: CURRENT_GRAPH.AdjList[i].adjacent[j].data,
            demand: CURRENT_GRAPH.AdjList[i].adjacent[j].data.demand,
          });
        }
        console.log("Demand: ", this.customerDemand);
        return this.customerDemand;
      }
    }
  }
  getCustomer() {
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      if (CURRENT_GRAPH.AdjList[i].data.id == this.id) {
        return CURRENT_GRAPH.AdjList[i].adjacent;
      }
    }
  }
}
class BpmnNode {
  constructor(name, next, duration, id) {
    this.name = name;
    this.next = next;
    this.duration = duration;
    this.id = id;
    this.trigger = null;
    this.throw = null;
    this.throwEvent = null;
    this.actionCallback = [];
    this.deliveryOnCallback = [];
    this.hasRun = false;
    this.throwId = null;
  }
  run(obj) {
    console.log(obj.name + " | " + this.name);
    if (this.hasRun) {
      console.log("has run and run only once");
      obj.runState = RUN_STATE.CAN_RUN;
      this.hasRun = false;
      return;
    } else {
      this.hasRun = true;
    }
    if (this.actionCallback.length < 1) {
      //No action: default case:
      obj.runState = RUN_STATE.CAN_RUN;
    } else {
      for (let i = 0; i < this.actionCallback.length; i++) {
        this.actionCallback[i].callback(obj);
      }
    }
  }
}
class Event extends BpmnNode {
  constructor(
    name,
    next,
    duration,
    type,
    startType,
    startTime,
    actionCallback,
    id
  ) {
    super(name, next, duration, id);
    this.type = type;
    this.startType = startType;
    //this.canStart = false;
    this.multiple = false;
    this.startTime = startTime;
    this.actionCallback = actionCallback;
  }
}
class Gateway extends BpmnNode {
  constructor(name, next, type, actionCallback, id) {
    super(name, next, 0, id);
    this.type = type;
    this.actionCallback = actionCallback;
  }
}
class Activity extends BpmnNode {
  constructor(name, next, duration, actionCallback, id) {
    super(name, next, duration, id);
    this.actionCallback = actionCallback;
  }
  addCallBack(actionCallback) {
    this.actionCallback.push(actionCallback);
  }
}

class Transportation {
  constructor(name, type, src, des, capacity, cargo) {
    this.name = name;
    this.type = type;
    this.src = src;
    this.des = des;
    this.curCapacity = 0;
    this.capacity = capacity;
    this.cargo = cargo;
  }
  load(item, quantity) {
    console.log("Load");
    const temp = this.src.removeInventory(item, quantity);
    console.log("Vehicle Capacity before: ", this.curCapacity, this.capacity);
    if (this.curCapacity + temp.quantity >= this.capacity) {
      alert("Not enough capacity to load Vehicle !");
      return;
    }
    this.curCapacity += temp.quantity;
    this.cargo.push(temp);
    console.log("Vehicle  Capacity after: ", this.curCapacity, this.capacity);
    console.log("Back log: ", this.src.backOrder);
  }
  loadBulk(items) {
    if (this.src.backOrder.length > 0) {
      for (let i = 0; i < this.src.backOrder.length; i++) {
        this.load(this.src.backOrder[i], this.src.backOrder[i].quantity);
        this.src.backOrder.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < items.length; i++) {
      this.load(items[i], items[i].quantity);
    }
  }
  unload(item, quantity, obj) {
    console.log("Unload");
    console.log(item);
    this.curCapacity -= quantity;
    this.des.addInventory(item, quantity);
  }
  move() {
    console.log("Move from scr to des");
  }
  print() {
    console.log("This truck: ");
    console.log("type: ", this.type);
    console.log("src: ", this.src);
    console.log("des: ", this.des);
    console.log("curCapacity: ", this.curCapacity);
    console.log("capacity: ", this.capacity);
    console.log("cargo: ", this.cargo);
  }
}

class ExportObject {
  constructor(obj) {
    this.name = obj.name;
    this.type = obj.type;
    this.location = {
      latitude: obj.location.latitude,
      longitude: obj.location.longitude,
    };
    this.inventory = obj.inventory;
    this.demand = obj.demand;
  }

  ToJSON() {
    return JSON.stringify(this);
  }
}

export {
  Node,
  Graph,
  Agent,
  Event,
  Activity,
  Gateway,
  Transportation,
  ExportObject,
};
