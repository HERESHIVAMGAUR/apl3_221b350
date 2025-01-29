
public class Voice {


    public final void templateMethod() {
        prepareVoice();  
        hear();          
    }


    private void prepareVoice() {
        Animal[] animals = new Animal[5];
        animals[0] = new Cow();
        animals[1] = new Dog();
        animals[2] = new Pig();
        animals[3] = new Goat();
        animals[4] = new Lion();
        
 
        this.animals = animals;
    }


    private Animal[] animals;

    private void hear() {
        if (animals != null) {
            for (Animal animal : animals) {
                animal.makeVoice();  
            }
        } else {
            System.out.println("Error: Animals not prepared!");
        }
    }
}
