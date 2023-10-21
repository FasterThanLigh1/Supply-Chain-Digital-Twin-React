import random
import time
import threading
from azure.iot.device import IoTHubDeviceClient, Message
# importing the multiprocessing module
import multiprocessing
import os
import mysql.connector
from faker import Faker
from datetime import datetime, timedelta
import simplejson as json
from flask import Flask, jsonify

#MINUTE
INTERVAL = 1
#2023-11-24 09:30:00
cur_time = datetime(2023, 7, 24, 3, 59)
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Chip1018!",
    database="supplychain",
)


def worker1():
    # printing process id
    print("ID of process running worker1: {}".format(os.getpid()))
    print(mydb)
    mycursor = mydb.cursor()
    mycursor.execute("SELECT * FROM persons")
    myresult = mycursor.fetchone()
    for x in myresult:
        print(x)
    myresult = mycursor.fetchone()
    for x in myresult:
        print(x)


def worker2():
    # printing process id
    print("ID of process running worker2: {}".format(os.getpid()))
    mycursor = mydb.cursor()
    mycursor.execute("SELECT * FROM company")
    myresult = mycursor.fetchall()
    for x in myresult:
        print(x)

def FakeFetch(table, interval, init_time, id):
    t1 = IoTHubDeviceClient.create_from_connection_string(id)
    mycursor = mydb.cursor()
    mycursor.execute(f"SELECT * FROM {table}")
    columns = mycursor.column_names
    myresult = mycursor.fetchall()
    table_len = len(myresult)
    print(f"Length of table {table}: {table_len}")
    index = 0
    while True:
        print(f"Table {table} index: {index}")
        print("index time: ", myresult[index][1].time())
        print("cur time: ", init_time.time())
        if myresult[index][1].time() == init_time.time():
            send_telemetry_with_data(t1, columns, myresult[index], table)
            print(f"From table {table} at time {init_time.time()}: {myresult[index]})")
            print("String: ", str(myresult[index]))
            index += 1
            if (index < table_len):
                if myresult[index][1].time() == init_time.time():
                    send_telemetry_with_data(t1, columns, myresult[index], table)
                    print(f"From table {table} at time {init_time.time()}: {myresult[index]})")
                    index += 1
                    if (index < table_len):
                        if myresult[index][1].time() == init_time.time():
                            send_telemetry_with_data(t1, columns, myresult[index], table)
                            print(f"From table {table} at time {init_time.time()}: {myresult[index]})")
                            index += 1
            else:
                index = 0
        init_time += timedelta(minutes=INTERVAL)
        time.sleep(interval)

    # for x in myresult:
    #     print(f"From table {table} at time {init_time.time()}: {x})")
    #     print(x[1].time())
    #     init_time += timedelta(minutes=INTERVAL)
    #     time.sleep(interval)

def StartSimulation():
    bakery_cashier_1 = "HostName=DemoIOT.azure-devices.net;DeviceId=bakery_cashier_1;SharedAccessKey=0yAUpTWOIRGpkRQi6jy2Rs/hJKuLqDWLgOlFmUlmD7Y="
    bakery_machine_1 = "HostName=DemoIOT.azure-devices.net;DeviceId=bakery_machine_1;SharedAccessKey=kjhmveIgF2dk1DykR0NKNuqpUeZhB7fg/4bT3pTVvk4="
    truck_1 = "HostName=DemoIOT.azure-devices.net;DeviceId=truck_1;SharedAccessKey=+O+cTIvPOAcjH9af6GpK8lrCwTvUppEDu171r1SNnDQ="
    truck_2 = "HostName=DemoIOT.azure-devices.net;DeviceId=truck_2;SharedAccessKey=Y0eIseEVvk3najhf28OCMsXN4DtTVpPHDUX40j3uGfc="
    bakery_machine_2 = "HostName=DemoIOT.azure-devices.net;DeviceId=bakery_machine_2;SharedAccessKey=WWe0awP42ohP9iD9zYmS12ZyPmhih+8BkAIoTG8pdv0="
    bakery_cashier_2 = "HostName=DemoIOT.azure-devices.net;DeviceId=bakery_cashier_2;SharedAccessKey=LIpr7nPlS9Qb6PmwcltSNM2wz0pBx3sRnAIoTMqGdWM="
    # creating processes
    p1 = multiprocessing.Process(target=FakeFetch, args=("sales_record",0.5,cur_time,bakery_cashier_1,))
    p2 = multiprocessing.Process(target=FakeFetch, args=("machine_1",0.5,cur_time,bakery_machine_1))
    p3 = multiprocessing.Process(target=FakeFetch, args=("truck_1",0.5,cur_time,truck_1))
    # starting processes
    p1.start()
    p2.start()
    p3.start()
    # wait until processes are finished
    p1.join()
    p2.join()
    p3.join()
    # both processes finished
    print("Both processes finished execution!")

def FakePrint():
    faker = Faker()
    print(faker.email())
    print(faker.name())


def FakeTable():
    mycursor = mydb.cursor()
    mycursor.execute("SHOW TABLES")
    for x in mycursor:
        print(x)
    mycursor.execute("CREATE TABLE if not exists mock_data2 (name VARCHAR(255), email VARCHAR(255))")


def FakeData(table):
    mycursor = mydb.cursor()
    faker = Faker()
    for i in range(100):
        name = faker.name()
        email = faker.email()
        mycursor.execute(f"INSERT INTO {table} (name, email) VALUES ('{name}', '{email}')")
    mycursor.execute(f"SELECT * from persons")
    e = mycursor.fetchall()
    print(e)


def read_temperature(value):
    temperature = value
    temperature += random.uniform(-0.5, 0.5)
    return temperature

def read_humidity(value):
    humidity = value
    humidity += random.uniform(-1, 1)
    return humidity

def read_longitude(value):
    longitude = value
    longitude += random.uniform(-0.5, 0.5)
    return longitude
def read_latitude(value):
    latitude = value
    latitude += random.uniform(-0.5, 0.5)
    return latitude

def read_cargo_weight(value):
    weight = value
    weight += random.uniform(-1, 1)
    return weight

def read_velocity(value):
    velocity = value
    velocity += random.uniform(-1, 1)
    return velocity

def read_direction(value):
    direction = value
    return direction

def read_random(value, min, max):
    rand = value
    rand += random.uniform(min, max)
    return rand

def read_random_int(value, min, max):
    rand = value
    rand += random.randint(min, max)
    return rand
def send_vehicle_telemetry(device_client, truck_id):
    try:
        # Instantiate the simulated temperature sensor

        while True:
            # Read the temperature and humidity from the sensor
            temperature = read_temperature(20)
            humidity = read_humidity(50)
            longitude = read_longitude(106.79323)
            latitude = read_latitude(10.8)
            cargo_weight = read_cargo_weight(800)
            velocity = read_velocity(80)

            type = 'truck'
            id = truck_id

            # myresult = mycursor.fetchone()
            # print(myresult)

            # Create the telemetry message
            payload = '{{ "temperature": {0}, "humidity": {1}, "longitude": {2}, "latitude": {3}, "type": "{4}", "id": "{5}", "cargo_weight": {6}, "speed": {7} }}'.format(temperature, humidity, longitude, latitude, type, id, cargo_weight, velocity)
            message = Message(payload)

            # Add custom properties to the message if desired
            # message.custom_properties["MyProperty"] = "MyValue"

            # Send the telemetry message
            print(f"Sending telemetry: {payload}")
            device_client.send_message(message)

            time.sleep(5)  # Delay between sending data

    except KeyboardInterrupt:
        print("Telemetry sending stopped by user")

def send_milk_monitor_telemetry(device_client, device_id):
    try:
        # Instantiate the simulated temperature sensor

        while True:
            # Read the temperature and humidity from the sensor
            milk_yield_total = read_random(20, -5, 5)
            milk_conductivity = read_random(50, -2, 2)
            milk_temperature = read_random(20, -5, 5)
            fat_content = read_random(10, -1, 1)
            protein_content = read_random(10, -1, 1)
            product_date = datetime.now()

            type = "milk-monitor"
            id = device_id
            # myresult = mycursor.fetchone()
            # print(myresult)

            # Create the telemetry message
            payload = '{{ "type": "{6}", "data": {{"milk_yield_total": {0}, "milk_conductivity": {1}, "milk_temperature": {2}, "fat_content": {3}, "protein_content": "{4}", "product_date": "{5}", "id": "{7}" }}}}'.format(milk_yield_total, milk_conductivity, milk_temperature, fat_content, protein_content, product_date, type, id)
            message = Message(payload)

            # Add custom properties to the message if desired
            # message.custom_properties["MyProperty"] = "MyValue"

            # Send the telemetry message
            print(f"Sending telemetry: {payload}")
            device_client.send_message(message)

            time.sleep(5)  # Delay between sending data

    except KeyboardInterrupt:
        print("Telemetry sending stopped by user")

def send_sales_monitor_telemetry(device_client, device_id):
    try:
        # Instantiate the simulated temperature sensor

        while True:
            # Read the temperature and humidity from the sensor
            item = "strawberry_milk"
            price = read_random(50, -2, 2)
            count = read_random_int(5, -1, 1)
            discount = "none"
            time_stamp = datetime.now()

            type = "sales-monitor"
            id = device_id
            # myresult = mycursor.fetchone()
            # print(myresult)

            # Create the telemetry message
            payload = '{{ "type": "{5}", "data": {{"item": "{0}", "price": {1}, "count": {2}, "discount": "{3}", "time_stamp": "{4}","id": "{6}" }}}}'.format(item, price, count, discount, time_stamp, type, id)
            message = Message(payload)

            # Add custom properties to the message if desired
            # message.custom_properties["MyProperty"] = "MyValue"

            # Send the telemetry message
            print(f"Sending telemetry: {payload}")
            device_client.send_message(message)

            time.sleep(5)  # Delay between sending data

    except KeyboardInterrupt:
        print("Telemetry sending stopped by user")

def StartSimulation1():
    # Define the connection strings and device IDs for each device
    # device1_connection_string = "HostName=DemoIOT.azure-devices.net;DeviceId=rasberry_pi;SharedAccessKey=3Q6ogP2mCwXgc4XhMpNEqnmavug/zvkVKfRlMYgrq6o="
    # device2_connection_string = "HostName=DemoIOT.azure-devices.net;DeviceId=milk_harvest_device;SharedAccessKey=gogDfvQ8qzvlKENGjU2GKKQo8Z/WtzUG9/mRPksBCk4="
    device_truck1 = "HostName=DemoIOT.azure-devices.net;DeviceId=truck_1;SharedAccessKey=+O+cTIvPOAcjH9af6GpK8lrCwTvUppEDu171r1SNnDQ="
    device_truck2 = "HostName=DemoIOT.azure-devices.net;DeviceId=truck_2;SharedAccessKey=Y0eIseEVvk3najhf28OCMsXN4DtTVpPHDUX40j3uGfc="
    device_milk_monitor = "HostName=DemoIOT.azure-devices.net;DeviceId=milk_harvest_device;SharedAccessKey=gogDfvQ8qzvlKENGjU2GKKQo8Z/WtzUG9/mRPksBCk4="
    device_sales_monitor = "HostName=DemoIOT.azure-devices.net;DeviceId=retailer_1_cashier;SharedAccessKey=cOF/JtQT753ODbo4u6+ywBzveUU7o2phhnZXccfbO0Y="

    # device1 = IoTHubDeviceClient.create_from_connection_string(device1_connection_string)
    # device2 = IoTHubDeviceClient.create_from_connection_string(device2_connection_string)
    truck1 = IoTHubDeviceClient.create_from_connection_string(device_truck1)
    truck2 = IoTHubDeviceClient.create_from_connection_string(device_truck2)
    milk1 = IoTHubDeviceClient.create_from_connection_string(device_milk_monitor)
    sales1 = IoTHubDeviceClient.create_from_connection_string(device_sales_monitor)

    truck1_thread = threading.Thread(target=send_vehicle_telemetry,
                                     args=(truck1, 'cdfd319b-c928-4a2e-a3d2-76b1490d5c76',))
    truck2_thread = threading.Thread(target=send_vehicle_telemetry,
                                     args=(truck2, 'd3fd328f-084d-4acb-bbd6-1be5f1cfc0ab',))
    milk1_thread = threading.Thread(target=send_milk_monitor_telemetry, args=(milk1, 'milk_monitoring_1'))
    sales_thread = threading.Thread(target=send_sales_monitor_telemetry, args=(sales1, 'sales_monitor_1'))

    # device1_thread.start()
    # device2_thread.start()
    truck1_thread.start()
    truck2_thread.start()
    milk1_thread.start()
    sales_thread.start()
    truck1_thread.join()
    truck2_thread.join()
    milk1_thread.join()
    sales_thread.join()

def send_telemetry_with_data(device_client, columns, data, table):
    try:
        row_dict = dict(zip(columns, data))
        for key, value in row_dict.items():
            if isinstance(value, datetime):
                row_dict[key] = value.strftime('%Y-%m-%d %H:%M:%S')
        json_data = json.dumps(row_dict)
        payload = f'{{ "id": "{table}", "data": {json_data}}}'
        message = Message(payload)
        print(f"Sending telemetry from table {table}: {payload}")
        device_client.send_message(message)

    except KeyboardInterrupt:
        print("Telemetry sending stopped by user")

if __name__ == "__main__":
    StartSimulation()