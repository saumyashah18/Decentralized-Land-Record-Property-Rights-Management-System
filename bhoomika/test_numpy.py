
try:
    import numpy as np
    print(f"NumPy version: {np.__version__}")
    a = np.array([1, 2, 3])
    print(f"Array: {a}")
except Exception as e:
    print(f"NumPy Error: {e}")

try:
    import pickle
    print("Pickle imported")
except Exception as e:
    print(f"Pickle Error: {e}")
