def check_login(passcode):
    passcode = [ord(i) for i in passcode]
    hidden = [70, 71, 67, 85, 123, 108, 105, 118, 105, 110, 103, 95, 119, 105, 116, 104, 95, 116, 104, 101, 95, 101, 97, 103, 108, 101, 115, 125]
    if len(passcode) != len(hidden):
        return False
    for i in range(len(hidden)):
        if hidden[i] != passcode[i]:
            return False
    return True

print("Login successful!" if check_login(input("Enter the password: ")) else "Login failed!")