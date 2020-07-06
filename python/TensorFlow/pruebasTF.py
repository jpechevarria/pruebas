from datetime import datetime
import numpy as np
import tensorflow as tf

print(datetime.now())

# Creates a graph.
##    a = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[2, 3], name='a')
##    b = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[3, 2], name='b')
##    c = tf.matmul(a, b)
##    d = tf.matmul(b, a)
##    # Creates a session with log_device_placement set to True.
sess = tf.Session(config=tf.ConfigProto(log_device_placement=True))
##    # Runs the op.
##    print(sess.run(c))
##    print(sess.run(d))
##    print(sess.run({'ab':(a, b), 'c':c, 'd':d }))

## PRUEBA PLACE HOLDERS
##x = tf.placeholder(tf.float64)
##y = tf.placeholder(tf.float64)
##z = x + y
##rand_array_1 = np.random.rand(4, 2)
##rand_array_2 = np.random.rand(4, 2)
##print(rand_array_1)
##print(rand_array_2)
##print(sess.run(z, feed_dict={x: rand_array_1, y: rand_array_2}))

    
##    vec = tf.random_uniform(shape=(3,))
##    out1 = vec + 1
##    out2 = vec + 2
##    out3 = out1 + out2
##    print(sess.run(vec))
##    print(sess.run(vec))
##    print(sess.run((out1,out2)))
##    print(sess.run(out1))
##    print(sess.run(out2))
##    print(sess.run(out3))

##a = tf.constant(3.0, dtype=tf.float32)
##b = tf.constant(4.0) # also tf.float32 implicitly
##total = a + b
##print(a)
##print(b)
##print(total)

##result = sess.run(total)

##print(result)

## PRUEBA SLICES 1
##my_data = [
##    [0, 1,],
##    [2, 3,],
##    [4, 5,],
##    [6, 7,],
##]
##
##
##slices = tf.data.Dataset.from_tensor_slices(my_data)
##next_item = slices.make_one_shot_iterator().get_next()
##
##result = sess.run(next_item)
##print(result)
##
##result = session.run(next_item)
##print(result)

## PRUEBA SLICES 2
##r = tf.random_normal([10,3])
##dataset = tf.data.Dataset.from_tensor_slices(r)
##iterator = dataset.make_initializable_iterator()
##next_row = iterator.get_next()
##
##sess.run(iterator.initializer)
##while True:
##  try:
##    print(sess.run(next_row))
##  except tf.errors.OutOfRangeError:
##    break

## LAYERS
##x = tf.placeholder(tf.float32, shape=[None, 3])
##linear_model = tf.layers.Dense(units=1)
##y = linear_model(x)
##
##init = tf.global_variables_initializer()
##sess.run(init)
##
##ret = sess.run(y, {x: [[1, 2, 3], [4, 5, 6]]})
##print(ret)

##Feature columns
##features = {
##    'sales' : [[5], [10], [8], [9]],
##    'department': ['sports', 'sports', 'gardening', 'gardening']}
##
##department_column = tf.feature_column.categorical_column_with_vocabulary_list(
##        'department', ['sports', 'gardening'])
##department_column = tf.feature_column.indicator_column(department_column)
##
##columns = [
##    tf.feature_column.numeric_column('sales'),
##    department_column
##]
##
##inputs = tf.feature_column.input_layer(features, columns)
##
##var_init = tf.global_variables_initializer()
##table_init = tf.tables_initializer()
####sess = tf.Session()
##ret = sess.run((var_init, table_init))
##
##print(sess.run(inputs))

#### FULL EXAMPLE
x = tf.constant([[1], [2], [3], [4]], dtype=tf.float32)
y_true = tf.constant([[0], [-1], [-2], [-3]], dtype=tf.float32)

linear_model = tf.layers.Dense(units=1)

y_pred = linear_model(x)
loss = tf.losses.mean_squared_error(labels=y_true, predictions=y_pred)

optimizer = tf.train.GradientDescentOptimizer(0.05)
train = optimizer.minimize(loss)

init = tf.global_variables_initializer()

sess = tf.Session()
sess.run(init)
for i in range(10000):
  _, loss_value = sess.run((train, loss))
  if i % 1000 == 0:
    print(i, loss_value)

print(sess.run(y_pred))

new_values = np.array(range(100),np.float32)+5
new_values = np.reshape(new_values,(100,1))
x = tf.constant(new_values, dtype=tf.float32)
estimate = linear_model(x)
print(sess.run(estimate))

print(datetime.now())


writer = tf.summary.FileWriter('.')
writer.add_graph(tf.get_default_graph())
writer.flush()
