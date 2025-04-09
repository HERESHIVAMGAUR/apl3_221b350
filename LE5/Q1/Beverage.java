abstract class Beverage {
    protected void pour(int qty) {
        System.out.println("Pour " + qty + " ml of beverage into a glass.");
    }
    
    protected abstract void add();
    
    protected void stir() {
        System.out.println("Stir the beverage.");
    }
    
    protected void serve() {
        System.out.println("Serve through waiter.");
    }

    public void template(int qty) {
        pour(qty);
        add();
        stir();
        serve();
    }
}

class Whisky extends Beverage {
  
    protected void add() {
        System.out.println("Add some soda.");
    }

    protected void stir() {
        System.out.println("Stir for 30 seconds.");
    }
}


class Beer extends Beverage{
    protected void add() {
        System.out.println("nothing to add");
}
}
