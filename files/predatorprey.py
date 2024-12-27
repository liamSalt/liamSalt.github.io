import random

H_init = 10
L_init = 2
max_gens = 100

H = H_init
L = L_init

generations = [[H_init, L_init,0,0]]

for i in range(max_gens):
        for j in range(L):
            kills = random.randint(0,100)
            if kills in range(0,5):
                kills = max(6,int(0.3*H))
            elif kills in range(5, 10):
                kills = max(5,int(0.25*H))
            elif kills in range (10,20):
                kills = max(4,int(0.20*H))
            elif kills in range(20,50):
                kills = max(3,int(0.15*H))
            elif kills in range(50,80):
                kills = max(2,int(0.10*H))
            elif kills in range(80,95):
                kills = max(1,int(0.05*H))
            else:
                kills = 0

            #print(f"Lynx {j+1} killed {kills} hares")

            kills = min(kills,H)
            
            H -= kills

            if kills < 3:
                L -=1

        generations[i][2] = H
        generations[i][3] = L

        print(generations[i])
        H = H*2
        L = L*2

        if H ==0:
            H = 3
        if L == 0:
            L = 1
            

        generations.append([H,L,0,0])
        

    

