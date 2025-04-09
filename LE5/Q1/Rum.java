
class Rum
{
    void pour(){
        System.out.println("pour 50ml Rum in a glass");
    }
    void add(){
       System.out.println("add some soda");
    }
    void stir(){
        System.out.println("stir for 30 seconds");
    }
    void serve(){
        System.out.println("serve through waiter");
    }
    
    public void templatemethod(){
        pour();
        add();
        stir();
        serve();
    }
}



