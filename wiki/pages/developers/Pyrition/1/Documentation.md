# Documentation
The Wikify component in Pyrition will automatically make pages for your functions.  
This will automatically:
-	Determine availability in singleplayer, multiplayer, and listen servers
-	Document parameter names
-	Indicate the realms
-	Link source files (and lines)

# Wiki Documentation
You can specify details with triple-dash comments (`---`). The contents of these comments are inserted into the wiki as Markdown. If you need multiple lines (say, for a table) you can use multi-line comments with an extra dash after the brackets (`--[[- markdown goes here! ]]`).  

## Wiki Meta Comments
These are triple-dash comments used to provide special information to the generated wiki page. Tags are placed immediately after the comment in SCREAMING_SNAKE_CASE with an optional colon to declare a list of parameters seperated by commas.  

Example:
```lua
function FROOTLOOPS:UsefulMethod(message, target)
	---INTERNAL
	---TYPES: any, Player/CRecipientFilter/table=nil
	---Does useful things with the specified targets given the message.

	--[[imagine amazing code being here instead of this comment]]
end

function FROOTLOOPS:DeprecatedMethod(something, another_thing, foo, bar)
	---DEPRECATED INTERNAL
	---TYPES: string, number, boolean=false, Entity=nil
	--[[-
	Removed as UsefulMethod does this much better.  
	This is another line of Markdown that will be added.  
	-	This
	-	is a
	-	list
	# This is a header
	With some text below it
	`code blocks with triple graves work too`
	]]

	---Extra line of mark down added after what is specified above

	--[[imagine amazing code being here instead of this comment]]
end
```

Tags and their purpose:
| Tag          | Parameters | Purpose                                                                                                                    |
| ------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `INTERNAL`   | No         | Marks the function as internal, warning developers not to use it.                                                          |
| `TYPES`      | Yes        | List the types of the parameters declared in the function. List multiple for the same variable using forward slashes (`/`) |
| `DEPRECATED` |            |                                                                                                                            |

## Code
Code blocks work just the same and come with code highlighting. Only language (and format) highlights that have any application in Garry's Mod are implemented.  
The list is as follows:
| Key        | Language / Format          |
| ---------- | -------------------------- |
| `css`      | Cascading Style Sheets     |
| `js`       | JavaScript                 |
| `json`     | JavaScript Object Notation |
| `lua`      | Lua                        |
| `markdown` | Markdown                   |
| `sql`      | Structured Query Language  |
| `xml`      | Extensible Markup Language |