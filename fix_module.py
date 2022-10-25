# module has a wrong import which errors idk why
f = open('node_modules/tsparticles-interaction-external-connect/esm/Connector.js', 'r')
t = f.readlines()
t[0] = "import { ExternalInteractorBase, drawLine, isInArray } from 'tsparticles-engine';"
f.close()

f = open('node_modules/tsparticles-interaction-external-connect/esm/Connector.js', 'w')
f.writelines( t )
f.close()
